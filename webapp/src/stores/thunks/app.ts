import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAppData = createAsyncThunk(
  'app/fetchAppData',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('/api/app', { method: 'GET' });
      return response.json();
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error || 'Failed to fetch app data');
    }
  });
