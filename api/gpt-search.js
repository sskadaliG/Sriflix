// Serverless endpoint for AI movie search (Google Gemini).
// Runs on the server so the API key stays secret, then looks up each
// suggested title on TMDB and returns everything in one response.

const MAX_QUERY_LENGTH = 200;

const buildPrompt = (query) =>
  "Act as a movie recommendation system and suggest some movies for the query: " +
  query +
  ". Only give me names of 5 movies, comma separated, like this example: Pokiri, Don, King, Khaleja, Dhruva";

const searchTmdb = async (title) => {
  const params = new URLSearchParams({ query: title, include_adult: "false", language: "en-US" });
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
      accept: "application/json",
    },
  });
  const data = await response.json();
  return data.results || [];
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
        body: JSON.stringify({ contents: [{ parts: [{ text: buildPrompt(query) }] }] }),
      }
    );

    if (!aiResponse.ok) {
      return res.status(502).json({ error: "Movie suggestions are unavailable right now" });
    }

    const aiData = await aiResponse.json();
    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const movieNames = content
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (movieNames.length === 0) {
      return res.status(502).json({ error: "No suggestions returned, try rephrasing" });
    }

    // Look up all suggested titles in parallel.
    const movieResults = await Promise.all(movieNames.map(searchTmdb));

    return res.status(200).json({ movieNames, movieResults });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong, please try again" });
  }
};
