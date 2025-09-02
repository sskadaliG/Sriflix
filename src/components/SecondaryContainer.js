import React from 'react'
import MovieList from './MovieList'
import { useSelector } from 'react-redux'
import usePopularMovies from '../hooks/usePopularMovies';
import useTopRatedMovies from '../hooks/useTopRatedMovies';

const SecondaryContainer = () => {
  const movies = useSelector(store => store.movies);
  usePopularMovies();
  useTopRatedMovies();

  return (
    <div className="bg-black px-16">
      <div className="relative z-20 -mt-80">
        <MovieList title={"Now Playing Movies"} movies={movies.nowPlayingMovies} />
        <MovieList title={"TopRated"} movies={movies.topRatedMovies} />
        <MovieList title={"Trending"} movies={movies.popularMovies} />
        <MovieList title={"Action"} movies={movies.nowPlayingMovies} />
        <MovieList title={"Comedy"} movies={movies.nowPlayingMovies} />
        <MovieList title={"Animation"} movies={movies.nowPlayingMovies} />
        <MovieList title={"Crime"} movies={movies.nowPlayingMovies} />
        <MovieList title={"Drama"} movies={movies.nowPlayingMovies} />
        <MovieList title={"Horror"} movies={movies.nowPlayingMovies} />
        <MovieList title={"Mystery"} movies={movies.nowPlayingMovies} />
        <MovieList title={"Romance"} movies={movies.nowPlayingMovies} />
        <MovieList title={"Fiction"} movies={movies.nowPlayingMovies} />
      </div>
    </div>
  )
}

export default SecondaryContainer