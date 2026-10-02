import React from 'react'
import { useDispatch } from 'react-redux'
import { IMG_CDN_URL } from '../utils/constants'
import { openMovie } from '../utils/movieSlice'

const MovieCard = ({ movie }) => {
  const dispatch = useDispatch();
  if (!movie?.poster_path) return null;
  return (
    <button
      type="button"
      onClick={() => dispatch(openMovie(movie))}
      className="w-48 shrink-0 pr-2 my-2 transition-transform duration-300 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
      aria-label={`Play trailer for ${movie.title}`}
    >
      <img className="rounded" alt="movie-image" src={IMG_CDN_URL + movie.poster_path} />
    </button>
  )
}

export default MovieCard
