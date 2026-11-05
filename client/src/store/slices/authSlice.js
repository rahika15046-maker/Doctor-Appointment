import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const res = await api.getMe();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Session expired');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.login(credentials);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await api.register(userData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});

export const googleLoginUser = createAsyncThunk('auth/googleLogin', async (googleData, { rejectWithValue }) => {
  try {
    const res = await api.googleLogin(googleData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Google sign-in failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.logout();
    return null;
  } catch (err) {
    return rejectWithValue(err.message || 'Logout failed');
  }
});

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const res = await api.updateProfile(profileData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Profile update failed');
  }
});

export const uploadUserAvatar = createAsyncThunk('auth/uploadAvatar', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.uploadAvatar(formData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Avatar upload failed');
  }
});

export const changeUserPassword = createAsyncThunk('auth/changePassword', async (passwords, { rejectWithValue }) => {
  try {
    const res = await api.changePassword(passwords);
    return res.message;
  } catch (err) {
    return rejectWithValue(err.message || 'Password change failed');
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialCheckDone: false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialCheckDone = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.initialCheckDone = true;
      })
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.successMessage = `Welcome back, ${action.payload.name}!`;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.successMessage = 'Registration successful! Welcome to Medora.';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // googleLoginUser
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.successMessage = `Signed in with Google as ${action.payload.name}`;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.successMessage = 'Logged out successfully.';
      })
      // updateUserProfile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.successMessage = 'Profile updated successfully!';
      })
      // uploadUserAvatar
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
        state.successMessage = 'Profile picture updated!';
      })
      // changeUserPassword
      .addCase(changeUserPassword.fulfilled, (state, action) => {
        state.successMessage = action.payload || 'Password changed successfully!';
      });
  },
});

export const { clearAuthError, clearSuccessMessage, setUser } = authSlice.actions;
export default authSlice.reducer;
