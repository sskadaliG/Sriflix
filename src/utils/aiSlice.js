import { createSlice } from "@reduxjs/toolkit";


const aiSlice = createSlice({
    name: "ai",
    initialState: {
        showAiSearch: false,
        movieResults: null,
        movieNames: null
    },
    reducers: {
        toggleAiSearchView: (state) => {
            state.showAiSearch = !state.showAiSearch
        },
        addAiMovieResult: (state,action) => {
            const {movieNames, movieResults} = action.payload;
            state.movieNames = movieNames;
            state.movieResults = movieResults
        }
    }
}

);

export const {toggleAiSearchView, addAiMovieResult} = aiSlice.actions;

export default aiSlice.reducer;