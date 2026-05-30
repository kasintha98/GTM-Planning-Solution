import { describe, it, expect } from "vitest";
import plansReducer, {
  clearSelected,
  clearError,
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../store/slices/plansSlice";
import type { GtmPlan } from "../types";

const samplePlan: GtmPlan = {
  id: 1,
  name: "EMEA Cloud Expansion 2026",
  description: "Grow cloud in EMEA",
  region: "EMEA",
  product: "SAP S/4HANA Cloud",
  status: "ACTIVE",
  budget: 500000,
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  owner: "Jane Smith",
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
  kpiCount: 3,
  kpiAchievementRate: 75,
};

const initialState = {
  items: [],
  summary: null,
  selected: null,
  loading: false,
  error: null,
};

describe("plansSlice reducer", () => {
  it("should return the initial state", () => {
    expect(plansReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should set loading true on fetchPlans.pending", () => {
    const state = plansReducer(initialState, fetchPlans.pending("", undefined));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("should populate items on fetchPlans.fulfilled", () => {
    const state = plansReducer(
      initialState,
      fetchPlans.fulfilled([samplePlan], "", undefined),
    );
    expect(state.loading).toBe(false);
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe("EMEA Cloud Expansion 2026");
  });

  it("should set error on fetchPlans.rejected", () => {
    const action = fetchPlans.rejected(
      new Error("Network error"),
      "",
      undefined,
    );
    const state = plansReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Network error");
  });

  it("should add new plan on createPlan.fulfilled", () => {
    const state = plansReducer(
      { ...initialState, items: [samplePlan] },
      createPlan.fulfilled(
        { ...samplePlan, id: 2, name: "New Plan" },
        "",
        {} as any,
      ),
    );
    expect(state.items).toHaveLength(2);
    expect(state.items[1].name).toBe("New Plan");
  });

  it("should update existing plan on updatePlan.fulfilled", () => {
    const updatedPlan = {
      ...samplePlan,
      name: "Updated Name",
      status: "COMPLETED" as const,
    };
    const state = plansReducer(
      { ...initialState, items: [samplePlan] },
      updatePlan.fulfilled(updatedPlan, "", { id: 1, data: {} as any }),
    );
    expect(state.items[0].name).toBe("Updated Name");
    expect(state.items[0].status).toBe("COMPLETED");
  });

  it("should remove plan on deletePlan.fulfilled", () => {
    const state = plansReducer(
      { ...initialState, items: [samplePlan] },
      deletePlan.fulfilled(1, "", 1),
    );
    expect(state.items).toHaveLength(0);
  });

  it("should clear selected plan", () => {
    const state = plansReducer(
      { ...initialState, selected: samplePlan },
      clearSelected(),
    );
    expect(state.selected).toBeNull();
  });

  it("should clear error", () => {
    const state = plansReducer(
      { ...initialState, error: "some error" },
      clearError(),
    );
    expect(state.error).toBeNull();
  });

  it("should not modify other items when updating one plan", () => {
    const plan2: GtmPlan = { ...samplePlan, id: 2, name: "APAC Plan" };
    const updatedPlan1 = { ...samplePlan, name: "Updated EMEA Plan" };
    const state = plansReducer(
      { ...initialState, items: [samplePlan, plan2] },
      updatePlan.fulfilled(updatedPlan1, "", { id: 1, data: {} as any }),
    );
    expect(state.items).toHaveLength(2);
    expect(state.items[0].name).toBe("Updated EMEA Plan");
    expect(state.items[1].name).toBe("APAC Plan");
  });
});
