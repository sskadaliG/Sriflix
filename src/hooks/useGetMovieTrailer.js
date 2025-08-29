import { useEffect } from 'react'
import { API_OPTIONS } from '../utils/constants';
import { useDispatch } from 'react-redux';
import { addMovieTrailer } from '../utils/movieSlice';

const useGetMovieTrailer = ({movieId}) => {
    const dispatch = useDispatch();

  const getMovieTrailer = async () => {
    const data = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`, API_OPTIONS);
    const json = await data.json();
    const trailer = json?.results?.[0]
    dispatch(addMovieTrailer(trailer));
  };

  useEffect(() => { getMovieTrailer() }, []);
  
};

export default useGetMovieTrailer;