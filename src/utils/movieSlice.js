import { createSlice } from "@reduxjs/toolkit";


const movieSlice = createSlice(
    {
        name: "movies",
        initialState: {
            nowPlayingMovies: null,
            movieTrailer: null,
            popularMovies: null,
            topRatedMovies: null,
            selectedMovie: null,
        },
        reducers: {
            addNowPlayingMovies: (state, action) => {
                state.nowPlayingMovies = action.payload
            },
            addMovieTrailer: (state, action) => {
                state.movieTrailer = action.payload
            },
            addPopularMovies: (state, action) => {
                state.popularMovies = action.payload
            },
            addTopRatedMovies: (state, action) => {
                state.topRatedMovies = action.payload
            },
            // The movie shown in the trailer pop-up (null when closed).
            openMovie: (state, action) => {
                state.selectedMovie = action.payload
            },
            closeMovie: (state) => {
                state.selectedMovie = null
            }
        }
    }
);

export default movieSlice.reducer;
export const { addNowPlayingMovies, addMovieTrailer, addPopularMovies, addTopRatedMovies, openMovie, closeMovie } = movieSlice.actions;