import React, { useRef } from 'react'
import lang from '../utils/languageConstants';
import { useDispatch, useSelector } from 'react-redux';
import openai from '../utils/openai';
import { API_OPTIONS } from '../utils/keys';
import { addGptMovieResult } from '../utils/gptSlice';


const GptSearchBar = () => {

  const language = useSelector((store) => store.config.lang);

  const selectText = useRef(null);

  const dispatch = useDispatch();

  const searchMovie = async (movie) => {
    const data = await fetch("https://api.themoviedb.org/3/search/movie?query=" + movie + "&include_adult=false&language=en-US", API_OPTIONS);
    const json = await data.json();
    return json.results;
  }

  const handleTextChange = async () => {
    console.log(selectText.current.value);

    const gptQuery = "Act as a movie recommendation system and suggest some movies for the query : " + selectText.current.value + ". only give me names of 5 movies, comma seperated like the example result given ahead. example result: Pokiri, Don, King, Khaleja, Dhruva"

    const gptResults = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        { role: 'user', content: gptQuery },
      ],
    });
    if(!gptResults.choices) {//TODO error handling
      }
    const gptMovies = gptResults?.choices[0]?.message?.content.split(", ");
    // const gptMovies = ['Gol Maal', 'Chupke Chupke', 'Padosan', 'Jaane Bhi Do Yaaro', 'Angoor'];
    console.log(gptMovies);
    //Chalti Ka Naam Gaadi, Padosan, Jaane Bhi Do Yaaro, Angoor, Andaz Apna Apna
    const promiseArray = gptMovies.map((movie) => searchMovie(movie));
    const searchResults = await Promise.all(promiseArray);
    console.log(searchResults); 
    dispatch(addGptMovieResult({movieNames:gptMovies, movieResults: searchResults}));   
  }

  return (
    <div className="flex items-start justify-center min-h-screen  pt-80  bg-gradient-to-r from-black">
      <div className="bg-black w-1/2 bg-opacity-80 flex rounded">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-12 w-full ">
          <input ref={selectText} className=" text-black p-4 m-4 col-span-9 rounded bg-opacity-80" type="text" placeholder={lang[language].gptSearchPlaceHolder}></input>
          <button className="bg-red-700 text-white my-4 mr-4 col-span-3 rounded bg-opacity-80 hover:opacity-80" onClick={handleTextChange}>{lang[language].search}</button>
        </form>
      </div>
    </div>

  )
}

export default GptSearchBar;