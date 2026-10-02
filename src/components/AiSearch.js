import React from 'react'
import AiSearchBar from './AiSearchBar'
import { BACKDROP_CLASSES } from '../utils/constants'
import AiMovieSuggestions from './AiMovieSuggestions'

const AiSearch = () => {
  return (
    <div>
        <div className={BACKDROP_CLASSES} />
        <AiSearchBar/>
        <AiMovieSuggestions/>
    </div>
  )
}

export default AiSearch;