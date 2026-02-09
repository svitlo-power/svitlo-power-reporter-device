import { createAction, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppState } from "../types";
import { fetchAppData } from "../thunks";

export const appStarted = createAction("app/started");

const initialState: AppState = {
  loading: true,
  currentView: 'main',
};

const appSlice = createSlice({
  name: 'app',
  initialState: initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<AppState['currentView']>) => {
      state.currentView = action.payload;
    }
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchAppData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppData.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchAppData.fulfilled, (state, action: PayloadAction<AppState>) => {
        state.appVer = action.payload.appVer;
        state.fsVer = action.payload.fsVer;
        state.ssid = action.payload.ssid;
        state.token = action.payload.token;
        state.loading = false;
      })
});

export const { setCurrentView } = appSlice.actions;
export const appReducer = appSlice.reducer;
