import { SportService } from '@/services/SportService';
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Sport from '@/models/Sport';



export const getSports = createAsyncThunk('sport/getSports', async () => {
    const response = await SportService.getAllSports();
    return response;
}
);
    

const initialState = {
    evalbleSports: [] as Sport[],
    loading: false

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
    extraReducers: (builder) => {
        builder
            .addCase(getSports.pending, (state) => {
                state.loading = true;
            })
            .addCase(getSports.fulfilled, (state, action) => {
                state.evalbleSports = action.payload as Sport[];
                state.loading = false;
            })
            .addCase(getSports.rejected, (state) => {
                state.loading = false;
            });
    }
});

export const {initSport} = sportSlice.actions;

export default sportSlice.reducer;
