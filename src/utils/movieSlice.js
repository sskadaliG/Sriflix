import { createSlice } from "@reduxjs/toolkit";


const movieSlice = createSlice(
    {
        name: "movies",
        initialState: {
            nowPlayingMovies: null,
            movieTrailer: null,
            popularMovies: null,
            topRatedMovies: null,
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
            }
        }
    }
);

export default movieSlice.reducer;
export const { addNowPlayingMovies, addMovieTrailer, addPopularMovies, addTopRatedMovies } = movieSlice.actions;