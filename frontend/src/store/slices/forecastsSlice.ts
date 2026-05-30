import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { forecastsApi } from "../../api";
import type { ForecastEntry, ForecastEntryRequest } from "../../types";

//forecastsSlice stores forecast entries and provides thunks to fetch
//and modify entries. UI components aggregate entries from this slice for charting and lists.

interface ForecastsState {
  items: ForecastEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: ForecastsState = { items: [], loading: false, error: null };

export const fetchForecasts = createAsyncThunk(
  "forecasts/fetchAll",
  async (planId?: number) => {
    const res = await forecastsApi.getAll(planId);
    return res.data;
  },
);

export const createForecast = createAsyncThunk(
  "forecasts/create",
  async (data: ForecastEntryRequest) => {
    const res = await forecastsApi.create(data);
    return res.data;
  },
);

export const deleteForecast = createAsyncThunk(
  "forecasts/delete",
  async (id: number) => {
    await forecastsApi.delete(id);
    return id;
  },
);

const forecastsSlice = createSlice({
  name: "forecasts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchForecasts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchForecasts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchForecasts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed";
      })
      .addCase(createForecast.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteForecast.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f.id !== action.payload);
      });
  },
});

export default forecastsSlice.reducer;
