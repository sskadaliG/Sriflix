import React from 'react'
import { useSelector } from 'react-redux'
import MovieList from './MovieList';

const AiMovieSuggestions = () => {
    const { movieResults, movieNames } = useSelector((store) => store.ai);
    if (!movieNames) return null;

    // Best TMDB match for each AI suggestion, shown together in one row.
    const topPicks = movieResults.map((results) => results[0]).filter(Boolean);

    return (
        <div className="bg-black px-8 pb-8 text-white bg-opacity-60">
            <MovieList title="✨ AI picks for you" movies={topPicks} />
            <p className="text-gray-400 text-sm pt-2">{movieNames.join(" · ")}</p>
        </div>
    )
}

export default AiMovieSuggestions
