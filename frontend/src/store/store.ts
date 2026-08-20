import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/auth-slice';
import dashboardReducer from '@/features/admin-dashboard/store/dashboard-slice';
import userReducer from '@/features/user-dashboard/store/user-slice';
import toastReducer from '@/features/shared/store/toast-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    userDashboard: userReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
