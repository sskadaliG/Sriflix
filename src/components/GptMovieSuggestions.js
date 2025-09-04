import React from 'react'
import { useSelector } from 'react-redux'
import MovieList from './MovieList';

const GptMovieSuggestions = () => {
    const { movieResults, movieNames } = useSelector((store) => store.gpt);
    if (!movieNames) return null;
    return (
        <div className="bg-black p-4 text-white bg-opacity-80">
            <div className="relative z-2 -mt-80">
                {movieNames.map((movie, index) => <MovieList key={index} title={movie} movies={movieResults[index]}/>)}
            </div>
        </div>
    )
}

export default GptMovieSuggestions