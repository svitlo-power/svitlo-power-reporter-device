import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WifiState, WifiNetwork } from "../types";
import { scanWifiNetworks } from "../thunks";

const initialState: WifiState = {
  networks: [],
  loading: false,
  error: null,
};

const wifiSlice = createSlice({
  name: 'wifi',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(scanWifiNetworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanWifiNetworks.fulfilled, (state, action: PayloadAction<WifiNetwork[]>) => {
        state.loading = false;
        state.networks = action.payload;
      })
      .addCase(scanWifiNetworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to scan networks';
      })
});

export const wifiReducer = wifiSlice.reducer;
