import { RegisterRequest } from "@/models/requestObjects/RegisterRequest";
import UserType from "@/models/UserType";
import { createSlice } from "@reduxjs/toolkit";



const initialState = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    zipCode: '',
    bio: '',
    verified: false,
    role: UserType.DEFAULT
};

const userRegisterSlice = createSlice({
    name: 'userRegister',
    initialState,
    reducers: {
        updateUerData: (state, action) => {
            return {
                ...state,
                ...action.payload
            }
        }
    }
});

export const { updateUerData } = userRegisterSlice.actions;

export default userRegisterSlice.reducer;