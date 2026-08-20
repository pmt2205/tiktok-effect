import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TiktokStatus, OverlaySettings, GiftMappings, GiftMapping, LogEntry, Gift } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_MAPPINGS } from '@/lib/constants';

interface DashboardState {
  status: TiktokStatus;
  settings: OverlaySettings;
  mappings: GiftMappings;
  availableGifts: unknown[];
  logs: LogEntry[];
  selectedMappedGift: string;
  language: 'vi' | 'en';
  customGifts: Gift[];
}

const initialState: DashboardState = {
  status: {
    status: 'disconnected',
    username: '',
    viewerCount: 0,
    error: null,
  },
  settings: DEFAULT_SETTINGS,
  mappings: DEFAULT_MAPPINGS,
  availableGifts: [],
  logs: [],
  selectedMappedGift: Object.keys(DEFAULT_MAPPINGS)[0] || '',
  language: 'vi',
  customGifts: [],
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<TiktokStatus>) => {
      state.status = action.payload;
    },
    setViewerCount: (state, action: PayloadAction<number>) => {
      state.status.viewerCount = action.payload;
    },
    setSettings: (state, action: PayloadAction<OverlaySettings>) => {
      state.settings = action.payload;
    },
    setMappings: (state, action: PayloadAction<GiftMappings>) => {
      state.mappings = action.payload;
      // If the current selected mapped gift is no longer available in the mappings, reset it
      const keys = Object.keys(action.payload);
      if (keys.length > 0 && !keys.includes(state.selectedMappedGift)) {
        state.selectedMappedGift = keys[0];
      }
    },
    setAvailableGifts: (state, action: PayloadAction<unknown[]>) => {
      state.availableGifts = action.payload;
    },
    setCustomGifts: (state, action: PayloadAction<Gift[]>) => {
      state.customGifts = action.payload;
    },
    setSelectedMappedGift: (state, action: PayloadAction<string>) => {
      state.selectedMappedGift = action.payload;
    },
    addMapping: (state, action: PayloadAction<{ giftName: string; mapping: GiftMapping }>) => {
      const { giftName, mapping } = action.payload;
      state.mappings[giftName] = mapping;
      if (!state.selectedMappedGift) {
        state.selectedMappedGift = giftName;
      }
    },
    deleteMapping: (state, action: PayloadAction<string>) => {
      const giftName = action.payload;
      delete state.mappings[giftName];
      const keys = Object.keys(state.mappings);
      if (state.selectedMappedGift === giftName) {
        state.selectedMappedGift = keys.length > 0 ? keys[0] : '';
      }
    },
    addLog: {
      reducer: (state, action: PayloadAction<LogEntry>) => {
        state.logs.push(action.payload);
        if (state.logs.length > 100) {
          state.logs.shift(); // Keep maximum 100 log entries
        }
      },
      prepare: (tag: string, message: string, className: string = '') => {
        const time = new Date().toTimeString().split(' ')[0];
        const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        return { payload: { id, time, tag, message, className } };
      },
    },
    clearLogs: (state) => {
      state.logs = [];
    },
    setLanguage: (state, action: PayloadAction<'vi' | 'en'>) => {
      state.language = action.payload;
    },
  },
});

export const {
  setStatus,
  setViewerCount,
  setSettings,
  setMappings,
  setAvailableGifts,
  setCustomGifts,
  setSelectedMappedGift,
  addMapping,
  deleteMapping,
  addLog,
  clearLogs,
  setLanguage,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
