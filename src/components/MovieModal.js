import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeMovie } from '../utils/movieSlice'
import { fetchTmdb } from '../utils/tmdb'

// Pop-up that plays the selected movie's YouTube trailer with its details.
const MovieModal = () => {
  const movie = useSelector((store) => store.movies.selectedMovie);
  const dispatch = useDispatch();
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load the trailer whenever a different movie is opened.
  useEffect(() => {
    if (!movie) return;
    let cancelled = false;
    setTrailerKey(null);
    setLoading(true);
    fetchTmdb(`movie/${movie.id}/videos`, { language: "en-US" })
      .then((json) => {
        const videos = (json.results || []).filter((v) => v.site === "YouTube");
        const trailer = videos.find((v) => v.type === "Trailer") || videos[0];
        // Ignore the response if the user already closed or switched movies.
        if (!cancelled) setTrailerKey(trailer?.key || null);
      })
      .catch((err) => console.error(err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [movie]);

  // Close on Escape and stop the page behind from scrolling while open.
  useEffect(() => {
    if (!movie) return;
    const onKeyDown = (e) => e.key === "Escape" && dispatch(closeMovie());
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [movie, dispatch]);

  if (!movie) return null;

  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-80 p-4"
      onClick={() => dispatch(closeMovie())}
      role="dialog"
      aria-modal="true"
      aria-label={movie.title}
    >
      <div
        className="relative mt-12 w-full max-w-4xl rounded-lg bg-neutral-900 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => dispatch(closeMovie())}
          className="absolute -top-12 right-0 h-10 w-10 rounded-full bg-neutral-800 text-xl font-bold hover:bg-neutral-600"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-black flex items-center justify-center">
          {trailerKey ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title={`${movie.title} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <p className="text-gray-400">{loading ? "Loading trailer..." : "Trailer not available"}</p>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-3xl font-bold">{movie.title}</h2>
          <p className="mt-1 text-sm text-gray-400">
            {[year, rating && `★ ${rating}`].filter(Boolean).join("  ·  ")}
          </p>
          {movie.overview && <p className="mt-4 text-gray-200 leading-relaxed">{movie.overview}</p>}
        </div>
      </div>
    </div>
  )
}

export default MovieModal
