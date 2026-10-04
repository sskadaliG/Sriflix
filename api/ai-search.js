// Serverless endpoint for AI movie search (Google Gemini).
// Runs on the server so the API key stays secret, then looks up each
// suggested title on TMDB and returns everything in one response.

const { createRemoteJWKSet, jwtVerify } = require("jose");

const MAX_QUERY_LENGTH = 200;

// Firebase ID tokens are JWTs signed by Google. Verifying them against
// Google's public keys only needs the project ID, no service account.
// The key set is cached across warm invocations.
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

// Returns the signed-in user's uid, or null if the token is missing or invalid.
const verifyFirebaseToken = async (req) => {
  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
  const match = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  if (!projectId || !match) return null;

  try {
    const { payload } = await jwtVerify(match[1], FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    });
    return payload.sub || null;
  } catch (err) {
    return null;
  }
};

const buildPrompt = (query) =>
  "Act as a movie recommendation system. Suggest 5 real movies for this request: " + query;

// Ask Gemini for JSON matching this schema instead of free text, so titles
// containing commas or extra chatter can't break parsing.
const RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      year: { type: "INTEGER" },
    },
    required: ["title", "year"],
  },
};

// Lowercase and strip punctuation so "WALL·E" matches "Wall-E".
const normalize = (text) => (text || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const searchTmdb = async ({ title, year }) => {
  const params = new URLSearchParams({ query: title, include_adult: "false", language: "en-US" });
  if (year) params.set("year", year);
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
      accept: "application/json",
    },
  });
  const data = await response.json();

  // If any result matches the title exactly, show only those, so "King"
  // doesn't become "The Return of the King". Otherwise fall back to the
  // most popular matches.
  const target = normalize(title);
  const isExact = (movie) => normalize(movie.title) === target || normalize(movie.original_title) === target;
  const matches = (data.results || [])
    .filter((movie) => movie.poster_path)
    .sort((a, b) => b.popularity - a.popularity);
  const exact = matches.filter(isExact);
  return exact.length > 0 ? exact : matches;
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Only signed-in users can spend Gemini quota.
  const uid = await verifyFirebaseToken(req);
  if (!uid) {
    return res.status(401).json({ error: "Please sign in to use AI search" });
  }

  const query = (req.body?.query || "").trim();
  if (!query || query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: `Query must be 1-${MAX_QUERY_LENGTH} characters` });
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(query) }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      return res.status(502).json({ error: "Movie suggestions are unavailable right now" });
    }

    const aiData = await aiResponse.json();
    const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const suggestions = JSON.parse(text)
      .filter((movie) => movie?.title)
      .slice(0, 5);

    if (suggestions.length === 0) {
      return res.status(502).json({ error: "No suggestions returned, try rephrasing" });
    }

    // Look up all suggested titles in parallel.
    const movieResults = await Promise.all(suggestions.map(searchTmdb));
    const movieNames = suggestions.map((movie) => `${movie.title} (${movie.year})`);

    return res.status(200).json({ movieNames, movieResults });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong, please try again" });
  }
};
