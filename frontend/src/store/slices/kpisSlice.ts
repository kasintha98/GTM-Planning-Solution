import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { kpisApi } from "../../api";
import type { KpiMetric, KpiMetricRequest } from "../../types";

//kpisSlice manages KPI metric state and exposes thunks for CRUD operations.
// it calls the backend via kpisApi

interface KpisState {
  items: KpiMetric[];
  loading: boolean;
  error: string | null;
}

const initialState: KpisState = { items: [], loading: false, error: null };

export const fetchKpis = createAsyncThunk(
  "kpis/fetchAll",
  async (planId?: number) => {
    const res = await kpisApi.getAll(planId);
    return res.data;
  },
);

export const createKpi = createAsyncThunk(
  "kpis/create",
  async (data: KpiMetricRequest) => {
    const res = await kpisApi.create(data);
    return res.data;
  },
);

export const updateKpi = createAsyncThunk(
  "kpis/update",
  async ({ id, data }: { id: number; data: KpiMetricRequest }) => {
    const res = await kpisApi.update(id, data);
    return res.data;
  },
);

export const deleteKpi = createAsyncThunk("kpis/delete", async (id: number) => {
  await kpisApi.delete(id);
  return id;
});

const kpisSlice = createSlice({
  name: "kpis",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpis.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchKpis.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchKpis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed";
      })
      .addCase(createKpi.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateKpi.fulfilled, (state, action) => {
        const idx = state.items.findIndex((k) => k.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteKpi.fulfilled, (state, action) => {
        state.items = state.items.filter((k) => k.id !== action.payload);
      });
  },
});

export default kpisSlice.reducer;
