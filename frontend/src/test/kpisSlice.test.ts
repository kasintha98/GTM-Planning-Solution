import { describe, it, expect } from "vitest";
import kpisReducer, {
  fetchKpis,
  createKpi,
  updateKpi,
  deleteKpi,
} from "../store/slices/kpisSlice";
import type { KpiMetric } from "../types";

const sampleKpi: KpiMetric = {
  id: 1,
  planId: 1,
  planName: "EMEA Cloud Expansion 2026",
  metricName: "Revenue Growth",
  category: "Financial",
  targetValue: 100000,
  actualValue: 85000,
  unit: "EUR",
  period: "Q1 2026",
  status: "AT_RISK",
  achievementRate: 85,
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
};

const initialState = { items: [], loading: false, error: null };

describe("kpisSlice reducer", () => {
  it("should return initial state", () => {
    expect(kpisReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should set loading on fetchKpis.pending", () => {
    const state = kpisReducer(initialState, fetchKpis.pending("", undefined));
    expect(state.loading).toBe(true);
  });

  it("should populate KPIs on fetchKpis.fulfilled", () => {
    const state = kpisReducer(
      initialState,
      fetchKpis.fulfilled([sampleKpi], "", undefined),
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].metricName).toBe("Revenue Growth");
    expect(state.loading).toBe(false);
  });

  it("should set error on fetchKpis.rejected", () => {
    const action = fetchKpis.rejected(new Error("API error"), "", undefined);
    const state = kpisReducer(initialState, action);
    expect(state.error).toBe("API error");
  });

  it("should add KPI on createKpi.fulfilled", () => {
    const newKpi = { ...sampleKpi, id: 2, metricName: "Lead Generation" };
    const state = kpisReducer(
      { ...initialState, items: [sampleKpi] },
      createKpi.fulfilled(newKpi, "", {} as any),
    );
    expect(state.items).toHaveLength(2);
    expect(state.items[1].metricName).toBe("Lead Generation");
  });

  it("should update KPI on updateKpi.fulfilled", () => {
    const updated = {
      ...sampleKpi,
      status: "ACHIEVED" as const,
      achievementRate: 105,
    };
    const state = kpisReducer(
      { ...initialState, items: [sampleKpi] },
      updateKpi.fulfilled(updated, "", { id: 1, data: {} as any }),
    );
    expect(state.items[0].status).toBe("ACHIEVED");
    expect(state.items[0].achievementRate).toBe(105);
  });

  it("should delete KPI on deleteKpi.fulfilled", () => {
    const state = kpisReducer(
      { ...initialState, items: [sampleKpi] },
      deleteKpi.fulfilled(1, "", 1),
    );
    expect(state.items).toHaveLength(0);
  });

  it("should keep other KPIs when deleting one", () => {
    const kpi2 = { ...sampleKpi, id: 2, metricName: "Market Reach" };
    const state = kpisReducer(
      { ...initialState, items: [sampleKpi, kpi2] },
      deleteKpi.fulfilled(1, "", 1),
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].metricName).toBe("Market Reach");
  });
});
