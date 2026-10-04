// Serverless endpoint for AI movie search (Google Gemini).
// Runs on the server so the API key stays secret, then looks up each
// suggested title on TMDB and returns everything in one response.

const { createRemoteJWKSet, jwtVerify } = require("jose");
const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");

const MAX_QUERY_LENGTH = 200;

// Per-user and per-IP limits. Serverless instances don't share memory, so the
// counters live in Upstash Redis. Reads UPSTASH_REDIS_REST_URL/TOKEN (or the KV_REST_API_*
// names Vercel's Upstash integration sets).
const hasRedis = Boolean(
  (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
  (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)
);
const redis = hasRedis ? Redis.fromEnv() : null;
// The per-IP limit stops one person from getting around the per-user limits by
// creating lots of accounts. It's higher than the per-user one so a few people
// sharing a network (home, office, campus) don't block each other.
const RATE_LIMITS = redis
  ? [
    { label: "minute", key: "uid", limiter: new Ratelimit({ redis, prefix: "ai-search:minute", limiter: Ratelimit.slidingWindow(10, "1 m") }) },
    { label: "day", key: "uid", limiter: new Ratelimit({ redis, prefix: "ai-search:day", limiter: Ratelimit.fixedWindow(50, "1 d") }) },
    { label: "ip-day", key: "ip", limiter: new Ratelimit({ redis, prefix: "ai-search:ip-day", limiter: Ratelimit.fixedWindow(100, "1 d") }) },
  ]
  : [];

const RATE_LIMIT_MESSAGES = {
  minute: "Too many searches, please wait a minute and try again",
  day: "You've reached today's AI search limit, please come back tomorrow",
  "ip-day": "Too many searches from your network today, please come back tomorrow",
};

// Vercel sets x-real-ip to the client's address and overwrites any value the
// client sends, so it can't be spoofed to dodge the per-IP limit.
const getClientIp = (req) =>
  req.headers["x-real-ip"] || (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";

// Checks the limits in order and stops at the first one that's used up, so a
// request blocked by the minute limit doesn't also count against the daily ones.
// Returns null when allowed, or the blocking limit's label and reset time.
const checkRateLimit = async (ids) => {
  for (const { label, key, limiter } of RATE_LIMITS) {
    const { success, reset } = await limiter.limit(ids[key]);
    if (!success) return { label, reset };
  }
  return null;
};

// Firebase ID tokens are JWTs signed by Google. Verifying them against
// Google's public keys only needs the project ID, no service account.
// The key set is cached across warm invocations.
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

// Returns the verified token's claims, or null if the token is missing or invalid.
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
    return payload.sub ? payload : null;
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
  const user = await verifyFirebaseToken(req);
  if (!user) {
    return res.status(401).json({ error: "Please sign in to use AI search" });
  }
  // Signing up is free, so an unverified account could be a throwaway made to
  // get around the per-user limits. Require a verified email.
  if (user.email_verified !== true) {
    return res.status(403).json({ error: "Please verify your email to use AI search", code: "email-not-verified" });
  }

  const rawQuery = req.body?.query;
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
  if (!query || query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: `Query must be 1-${MAX_QUERY_LENGTH} characters` });
  }

  // Without a shared store there is no way to enforce the limits, so refuse
  // rather than let unlimited searches through.
  if (!redis) {
    return res.status(503).json({ error: "AI search is not configured" });
  }

  let blocked;
  try {
    blocked = await checkRateLimit({ uid: user.sub, ip: getClientIp(req) });
  } catch (err) {
    return res.status(503).json({ error: "AI search is unavailable right now" });
  }
  if (blocked) {
    const retryAfter = Math.max(1, Math.ceil((blocked.reset - Date.now()) / 1000));
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({ error: RATE_LIMIT_MESSAGES[blocked.label] });
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
