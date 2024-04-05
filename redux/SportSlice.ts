import { createSlice } from "@reduxjs/toolkit";


const initialState = {

};


const sportSlice = createSlice({
    name: 'sport',
    initialState, 
    reducers: {
        initSport: (state, action) => {
            return {
                ...state,
                ...action.payload
            }
        }
    },
});

export const {initSport} = sportSlice.actions;

export default sportSlice.reducer;
