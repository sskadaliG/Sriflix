import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addMovieTrailer } from '../utils/movieSlice';
import { fetchTmdb } from '../utils/tmdb';

const VideoBackground = ({ movieId }) => {

  const trailerVideo = useSelector(store => store.movies?.movieTrailer);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchTmdb(`movie/${movieId}/videos`, { language: "en-US" })
      .then((json) => {
        // Prefer an official YouTube trailer, fall back to any video.
        const videos = json.results || [];
        const trailer =
          videos.find((v) => v.site === "YouTube" && v.type === "Trailer") || videos[0];
        if (trailer) dispatch(addMovieTrailer(trailer));
      })
      .catch((err) => console.error(err));
  }, [movieId, dispatch]);

  return (
    <div className="w-screen">
      {trailerVideo?.key &&
        <iframe className="w-screen aspect-video"
          src={`https://www.youtube.com/embed/${trailerVideo.key}?&autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerVideo.key}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        // referrerPolicy="strict-origin-when-cross-origin" 
        >
        </iframe>
      }

    </div>
  )
}

export default VideoBackground;