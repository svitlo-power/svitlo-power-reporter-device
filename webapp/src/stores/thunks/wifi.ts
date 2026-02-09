import { createAsyncThunk } from "@reduxjs/toolkit";
import type { WifiNetwork } from "../types";

export const scanWifiNetworks = createAsyncThunk<WifiNetwork[]>(
    'wifi/scanNetworks',
    async (_, thunkAPI) => {
        let attempts = 0;
        while (attempts < 15) {
            try {
                const response = await fetch('/api/wifi/list', { method: 'GET' });

                // 202 means scanning is in progress
                if (response.status === 202) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }

                if (!response.ok) {
                    throw new Error('Failed to scan WiFi networks');
                }

                const data = await response.json();
                if (Array.isArray(data)) {
                    return data;
                }

                throw new Error('Invalid response format');
            } catch (error: unknown) {
                return thunkAPI.rejectWithValue((error as Error).message || 'Failed to scan WiFi networks');
            }
        }
        return thunkAPI.rejectWithValue('WiFi scan timed out');
    }
);
