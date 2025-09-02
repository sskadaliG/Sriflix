import React from 'react'
import MovieCard from './MovieCard'

const MovieList = ({title, movies}) => {
  return (
    <div>
      <h1 className="text-white font-bold text-xl pt-8 pb-2">{title}</h1>
      <div className="flex overflow-x-scroll">
        <div className="flex">
          {movies?.map(movie => <MovieCard key={movie?.id} poster_path={movie?.poster_path}/>)}
        </div>
        
      </div>
    </div>
  )
}

export default MovieList