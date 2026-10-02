import { useDispatch, useSelector } from 'react-redux';
import { addTopRatedMovies } from "../utils/movieSlice";
import { useEffect } from 'react';
import { fetchTmdb } from '../utils/tmdb';

const useTopRatedMovies = () => {
  const dispatch = useDispatch();
  const movies = useSelector((store) => store.movies.topRatedMovies);

  useEffect(() => {
    // Skip the network call if this list is already in the Redux store.
    if (movies) return;
    fetchTmdb("movie/top_rated", { language: "en-US", page: 1 })
      .then((json) => dispatch(addTopRatedMovies(json.results)))
      .catch((err) => console.error(err));
  }, [movies, dispatch]);
}

export default useTopRatedMovies;
