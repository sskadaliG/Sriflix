import React from 'react'
import GptSearchBar from './GptSearchBar'
import { BACKGROUND_LOGO } from '../utils/constants'
import GptMovieSuggestions from './GptMovieSuggestions'

const GptSearch = () => {
  return (
    <div>
        <img className="fixed top-0 left-0 w-full h-full object-cover -z-10 bg-gradient-to-r from-black" src={BACKGROUND_LOGO} alt="background-logo" />
        <GptSearchBar/>
        <GptMovieSuggestions/>
    </div>
  )
}

export default GptSearch;