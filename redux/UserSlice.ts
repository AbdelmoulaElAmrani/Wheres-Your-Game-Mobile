import {UserRequest} from "@/models/requestObjects/UserRequest";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import {AuthService} from "@/services/AuthService";
import {UserService} from "@/services/UserService";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {SportService} from "@/services/SportService";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {persistor} from "@/redux/ReduxConfig";


export const getUserProfile = createAsyncThunk('user/getUserProfile', async () => {
    const response = await UserService.getUser();
    return response;
});

export const getUserSports = createAsyncThunk<UserSportResponse[], string, { rejectValue: string }>(
    'user/getUserSports',
    async (userId: string, {rejectWithValue}) => {
        try {
            const response = await SportService.getUserSport(userId);
            if (!response) {
                return rejectWithValue('No data returned from the service');
            }
            return response;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const updateUserProfile = createAsyncThunk('user/updateUserProfile', async (user: UserRequest) => {
    console.log('in update user profile');
    console.log(user);
    const response = await UserService.updateUser(user);
    return response;
});

/*export const logout = createAsyncThunk('user/logout', async () => {
    AuthService.logOut();
    persistor.purge();
    persistor.flush();
});*/


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
    userSport: [{}] as UserSportResponse[],
    loading: false,

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
        },
        logout: (state, action) => {
            state.loading = false;
            state = initialState;
            // TODO:: Error on this state
            AuthService.logOut();
            persistor.purge();
            persistor.flush();
        }
    },
    // for promise methods like axios
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
            /* .addCase(logout.pending, (state) => {
                 state = initialState;
             })
             .addCase(logout.fulfilled, (state) => {
                 state = initialState;
             })
             .addCase(logout.rejected, (state) => {
                 state = initialState;
             })*/
            .addCase(getUserSports.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserSports.fulfilled, (state, action) => {
                state.loading = false;
                state.userSport = action.payload as UserSportResponse[];
            })
            .addCase(getUserSports.rejected, (state) => {
                state.loading = false;
            });
    }
});

export const {updateUserRegisterData, logout} = userSlice.actions;

export default userSlice.reducer;