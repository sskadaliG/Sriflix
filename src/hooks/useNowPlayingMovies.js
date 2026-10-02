import { useDispatch, useSelector } from 'react-redux';
import { addNowPlayingMovies } from "../utils/movieSlice";
import { useEffect } from 'react';
import { fetchTmdb } from '../utils/tmdb';

const useNowPlayingMovies = () => {
  const dispatch = useDispatch();
  const movies = useSelector((store) => store.movies.nowPlayingMovies);

  useEffect(() => {
    // Skip the network call if this list is already in the Redux store.
    if (movies) return;
    fetchTmdb("movie/now_playing", { language: "en-US", page: 1 })
      .then((json) => dispatch(addNowPlayingMovies(json.results)))
      .catch((err) => console.error(err));
  }, [movies, dispatch]);
}

export default useNowPlayingMovies;
