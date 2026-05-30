import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { plansApi } from "../../api";
import type { GtmPlan, GtmPlanRequest, PlanSummary } from "../../types";

interface PlansState {
  items: GtmPlan[];
  summary: PlanSummary | null;
  selected: GtmPlan | null;
  loading: boolean;
  error: string | null;
}

//plansSlice holds the list of GTM plans and handles async operations 
// via createAsyncThunk to call the backend API
const initialState: PlansState = {
  items: [],
  summary: null,
  selected: null,
  loading: false,
  error: null,
};

export const fetchPlans = createAsyncThunk(
  "plans/fetchAll",
  async (status?: string) => {
    const res = await plansApi.getAll(status);
    return res.data;
  },
);

//components dispatch `fetchPlans()` which triggers
//pending/fulfilled/rejected lifecycle updates handled below in extraReducers.

export const fetchPlanById = createAsyncThunk(
  "plans/fetchById",
  async (id: number) => {
    const res = await plansApi.getById(id);
    return res.data;
  },
);

export const fetchSummary = createAsyncThunk("plans/fetchSummary", async () => {
  const res = await plansApi.getSummary();
  return res.data;
});

export const createPlan = createAsyncThunk(
  "plans/create",
  async (data: GtmPlanRequest) => {
    const res = await plansApi.create(data);
    return res.data;
  },
);

export const updatePlan = createAsyncThunk(
  "plans/update",
  async ({ id, data }: { id: number; data: GtmPlanRequest }) => {
    const res = await plansApi.update(id, data);
    return res.data;
  },
);

export const deletePlan = createAsyncThunk(
  "plans/delete",
  async (id: number) => {
    await plansApi.delete(id);
    return id;
  },
);

const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selected = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed";
      })

      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })

      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      .addCase(createPlan.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(updatePlan.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })

      .addCase(deletePlan.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearSelected, clearError } = plansSlice.actions;
export default plansSlice.reducer;
