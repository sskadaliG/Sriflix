// Serverless proxy for TMDB so the API token never ships to the browser.
// Only the endpoints the app actually uses are allowed through.

const TMDB_BASE = "https://api.themoviedb.org/3/";
const ALLOWED_PATHS = /^(movie\/(now_playing|popular|top_rated|\d+\/videos)|search\/movie)$/;
const ALLOWED_PARAMS = ["page", "language", "query", "include_adult"];

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { path } = req.query;
  if (!path || !ALLOWED_PATHS.test(path)) {
    return res.status(400).json({ error: "Unsupported TMDB path" });
  }

  const params = new URLSearchParams();
  ALLOWED_PARAMS.forEach((key) => {
    if (req.query[key]) params.set(key, req.query[key]);
  });

  try {
    const response = await fetch(`${TMDB_BASE}${path}?${params}`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
        accept: "application/json",
      },
    });
    const data = await response.json();

    // Let Vercel's CDN cache successful responses for an hour to cut down on
    // TMDB calls. Never cache errors, or a bad token would stick for an hour.
    res.setHeader(
      "Cache-Control",
      response.ok ? "s-maxage=3600, stale-while-revalidate=86400" : "no-store"
    );
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Failed to reach TMDB" });
  }
};
