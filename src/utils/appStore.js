import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import movieReducer from "./movieSlice";
import aiReducer from "./aiSlice";
import configReducer from "./configSlice";

const appStore = configureStore(
    {
        reducer: {
            user: userReducer,
            movies: movieReducer,
            ai: aiReducer,
            config: configReducer
        }
    }
);

export default appStore;