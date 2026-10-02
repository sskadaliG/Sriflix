import { useDispatch, useSelector } from 'react-redux';
import { addPopularMovies } from "../utils/movieSlice";
import { useEffect } from 'react';
import { fetchTmdb } from '../utils/tmdb';

const usePopularMovies = () => {
  const dispatch = useDispatch();
  const movies = useSelector((store) => store.movies.popularMovies);

  useEffect(() => {
    // Skip the network call if this list is already in the Redux store.
    if (movies) return;
    fetchTmdb("movie/popular", { language: "en-US", page: 1 })
      .then((json) => dispatch(addPopularMovies(json.results)))
      .catch((err) => console.error(err));
  }, [movies, dispatch]);
}

export default usePopularMovies;
