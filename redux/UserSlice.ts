import { UserRequest } from "@/models/requestObjects/UserRequest";
import { UserResponse } from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import { UserService } from "@/services/UserService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";



export const getUserProfile = createAsyncThunk('user/getUserProfile', async () => {
    const response = await UserService.getUser();
    return response;
});

export const updateUserProfile = createAsyncThunk('user/updateUserProfile', async (user: UserRequest) => {
    console.log(user);
    const response = await UserService.updateUser(user);
    return response;
});



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
    },
    userData: {} as UserResponse,
    loading: false

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
    },
    // for promese methods like axios
    extraReducers: (builder) => {
        builder
            .addCase(getUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload as UserResponse;
            })
            .addCase(getUserProfile.rejected, (state) => {
                state.loading = false;
            })
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload as UserResponse;
            })
            .addCase(updateUserProfile.rejected, (state) => {
                state.loading = false;
            })

    }
});

export const { updateUserRegisterData } = userSlice.actions;

export default userSlice.reducer;