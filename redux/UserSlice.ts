import UserType from "@/models/UserType";
import { createSlice } from "@reduxjs/toolkit";



const initialState = {
    userRegister: {
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
    }
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUserRegisterData: (state, action) => {
            state.userRegister = {
                ...state.userRegister,
                ...action.payload
            }
        }
    }
});

export const { updateUserRegisterData } = userSlice.actions;

export default userSlice.reducer;