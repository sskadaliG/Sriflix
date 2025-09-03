import React from 'react'
import GptSearchBar from './GptSearchBar'
import GptBrowsePage from './GptBrowsePage'
import { BACKGROUND_LOGO } from '../utils/constants'

const GptSearch = () => {
  return (
    <div>
        <img className="absolute -z-10" src={BACKGROUND_LOGO} alt="background-logo" />
        <GptSearchBar/>
        <GptBrowsePage/>
    </div>
  )
}

export default GptSearch;