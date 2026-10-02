import React from 'react'
import GptSearchBar from './GptSearchBar'
import { BACKDROP_CLASSES } from '../utils/constants'
import GptMovieSuggestions from './GptMovieSuggestions'

const GptSearch = () => {
  return (
    <div>
        <div className={BACKDROP_CLASSES} />
        <GptSearchBar/>
        <GptMovieSuggestions/>
    </div>
  )
}

export default GptSearch;