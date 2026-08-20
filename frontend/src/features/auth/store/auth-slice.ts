import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  username: string;
  role: 'admin' | 'user';
  allowConnect?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthLoading: boolean;
  loading: boolean;
  error: string | null;
  successMsg: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthLoading: true,
  loading: false,
  error: null,
  successMsg: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state, action: PayloadAction<{ token: string | null; user: User | null }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthLoading = false;
    },
    authStart: (state) => {
      state.loading = true;
      state.error = null;
      state.successMsg = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.successMsg = 'Login successful! Redirecting...';
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', action.payload.token);
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      }
    },
    registerSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.successMsg = action.payload;
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      state.successMsg = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMsg = null;
    },
  },
});

export const {
  initializeAuth,
  authStart,
  loginSuccess,
  registerSuccess,
  authFailure,
  logout,
  clearMessages,
} = authSlice.actions;

export default authSlice.reducer;
