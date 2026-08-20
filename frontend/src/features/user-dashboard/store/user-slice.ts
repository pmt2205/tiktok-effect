import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserDashboardState {
  selectedGiftId: number | null;
  activePreviewVideo: string | null;
}

const initialState: UserDashboardState = {
  selectedGiftId: null,
  activePreviewVideo: null,
};

export const userSlice = createSlice({
  name: 'userDashboard',
  initialState,
  reducers: {
    setSelectedGiftId: (state, action: PayloadAction<number | null>) => {
      state.selectedGiftId = action.payload;
    },
    setActivePreviewVideo: (state, action: PayloadAction<string | null>) => {
      state.activePreviewVideo = action.payload;
    },
  },
});

export const { setSelectedGiftId, setActivePreviewVideo } = userSlice.actions;
export default userSlice.reducer;
