import React from 'react'
import lang from '../utils/language constants';
import { useSelector } from 'react-redux';

const GptSearchBar = () => {

  const language = useSelector((store) => store.config.lang)
  console.log(language);
  return (
    <div className="flex items-start justify-center min-h-screen  pt-60">
      <div className="bg-black w-1/2 bg-opacity-80 flex rounded">
        <form  onSubmit={(e) => e.preventDefault()} className="grid grid-cols-12 w-full ">
          <input className=" text-black p-4 m-4 col-span-9 rounded bg-opacity-80" type="text" placeholder={lang[language].gptSearchPlaceHolder}></input>
          <button className="bg-red-700 text-white my-4 mr-4 col-span-3 rounded bg-opacity-80">{lang[language].search}</button>
        </form>
      </div>
    </div>

  )
}

export default GptSearchBar;