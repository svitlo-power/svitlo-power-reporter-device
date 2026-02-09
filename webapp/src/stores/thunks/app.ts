import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAppData = createAsyncThunk(
  'app/fetchAppData',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('/api/app/config', { method: 'GET' });
      return response.json();
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error || 'Failed to fetch app data');
    }
  });

export const saveWifiConfig = createAsyncThunk(
  'app/saveWifiConfig',
  async (data: { ssid: string, password?: string }, thunkAPI) => {
    try {
      const response = await fetch('/api/wifi/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error || 'Failed to save WiFi config');
    }
  });

export const saveTokenConfig = createAsyncThunk(
  'app/saveTokenConfig',
  async (data: { token: string }, thunkAPI) => {
    try {
      const response = await fetch('/api/token/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error || 'Failed to save Token config');
    }
  });

export const saveAllConfigs = createAsyncThunk(
  'app/saveAllConfigs',
  async (data: { ssid: string, password?: string, token: string }, thunkAPI) => {
    try {
      const response = await fetch('/api/app/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error || 'Failed to save config');
    }
  });

export const resetDevice = createAsyncThunk(
  'app/resetDevice',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      return response.json();
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error || 'Failed to reset device');
    }
  });
