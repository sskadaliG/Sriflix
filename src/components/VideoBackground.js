import { useEffect } from 'react'
import { API_OPTIONS } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addMovieTrailer } from '../utils/movieSlice';

const VideoBackground = ({ movieId }) => {

  const trailerVideo = useSelector(store => store.movies?.movieTrailer);

  const dispatch = useDispatch();

  const getMovieTrailer = async () => {
    const data = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`, API_OPTIONS);
    const json = await data.json();
    const trailer = json.results[0]
    dispatch(addMovieTrailer(trailer));
  };

  useEffect(() => { getMovieTrailer() }, []);

  return (
    <div className="w-screen">
      {trailerVideo?.key &&
        <iframe className="w-screen aspect-video"
          src={`https://www.youtube.com/embed/${trailerVideo.key}?&autoplay=1&mute=1&controls=0&loop=1&rel=1`}
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