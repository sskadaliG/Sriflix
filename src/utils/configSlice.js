import { createSlice } from "@reduxjs/toolkit";


const consfigSlice = createSlice({
    name: "config",
    initialState: {
        lang: "en"
    },
    reducers: {
        selectLanguage: (state, action) => {
            state.lang = action.payload;
        }
    }
});

export const {selectLanguage} = consfigSlice.actions;
export default consfigSlice.reducer;