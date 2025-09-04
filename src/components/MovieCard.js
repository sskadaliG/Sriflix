import React from 'react'
import { IMG_CDN_URL } from '../utils/constants'

const MovieCard = ({poster_path}) => {
  if(!poster_path) return null;
  return (
    <div className="w-48 pr-2 my-2 transition-transform duration-300 ease-in-out 
             hover:scale-105">
        <img className="rounded" alt="movie-image" src={IMG_CDN_URL + poster_path }/>
    </div>
  )
}

export default MovieCard