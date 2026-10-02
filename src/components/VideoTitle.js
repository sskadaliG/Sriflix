import { useDispatch } from 'react-redux';
import { openMovie } from '../utils/movieSlice';

const VideoTitle = ({ movie }) => {
  const dispatch = useDispatch();
  const open = () => dispatch(openMovie(movie));

  return (
    <div className="w-screen aspect-video px-12 pt-[15%] bg-gradient-to-r from-black absolute">
      <h1 className="font-bold text-8xl py-4 text-white">{movie.title}</h1>
      <p className="w-3/6 text-sm text-white">{movie.overview}</p>
      <div className="flex py-8">
        <button onClick={open} className="font-bold text-black bg-white text-xl rounded hover:bg-gray-400 py-3 px-8 mr-4 bg-opacity-90">▶  Play</button>
        <button onClick={open} className="font-bold bg-gray-400 bg-opacity-50 text-white rounded text-xl hover:bg-gray-400 py-3 px-8">ⓘ  More Info</button>
      </div>
    </div>
  )
}

export default VideoTitle;
