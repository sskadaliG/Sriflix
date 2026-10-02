import React, { useRef, useState } from 'react'
import lang from '../utils/languageConstants';
import { useDispatch, useSelector } from 'react-redux';
import { addAiMovieResult } from '../utils/aiSlice';


const AiSearchBar = () => {

  const language = useSelector((store) => store.config.lang);

  const selectText = useRef(null);

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    const query = selectText.current.value.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    try {
      // The serverless function calls Gemini and TMDB so no keys reach the browser.
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed");

      dispatch(addAiMovieResult({ movieNames: data.movieNames, movieResults: data.movieResults }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center pt-36 pb-8">
      <div className="bg-black w-1/2 bg-opacity-80 rounded">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="grid grid-cols-12 w-full ">
          <input ref={selectText} maxLength={200} className=" text-black p-4 m-4 col-span-9 rounded bg-opacity-80" type="text" placeholder={lang[language].aiSearchPlaceHolder}></input>
          <button type="submit" disabled={loading} className="bg-red-700 text-white my-4 mr-4 col-span-3 rounded bg-opacity-80 hover:opacity-80 disabled:opacity-50">
            {loading ? "..." : lang[language].search}
          </button>
        </form>
        {error && <p className="text-red-500 font-bold px-4 pb-4">{error}</p>}
      </div>
    </div>

  )
}

export default AiSearchBar;
