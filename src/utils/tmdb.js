// All TMDB calls go through our /api/tmdb serverless proxy.
export const fetchTmdb = async (path, params = {}) => {
  const query = new URLSearchParams({ path, ...params });
  const response = await fetch(`/api/tmdb?${query}`);
  if (!response.ok) throw new Error(`TMDB request failed: ${response.status}`);
  return response.json();
};
