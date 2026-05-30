import axios from "axios";
import type {
  GtmPlan,
  GtmPlanRequest,
  KpiMetric,
  KpiMetricRequest,
  ForecastEntry,
  ForecastEntryRequest,
  PlanSummary,
} from "../types";

//Central axios instance used by all features.
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Plans
export const plansApi = {
  getAll: (status?: string) =>
    api.get<GtmPlan[]>("/plans", { params: status ? { status } : undefined }),
  getById: (id: number) => api.get<GtmPlan>(`/plans/${id}`),
  getSummary: () => api.get<PlanSummary>("/plans/summary"),
  create: (data: GtmPlanRequest) => api.post<GtmPlan>("/plans", data),
  update: (id: number, data: GtmPlanRequest) =>
    api.put<GtmPlan>(`/plans/${id}`, data),
  delete: (id: number) => api.delete(`/plans/${id}`),
};

// KPIs
export const kpisApi = {
  getAll: (planId?: number) =>
    api.get<KpiMetric[]>("/kpis", { params: planId ? { planId } : undefined }),
  getById: (id: number) => api.get<KpiMetric>(`/kpis/${id}`),
  create: (data: KpiMetricRequest) => api.post<KpiMetric>("/kpis", data),
  update: (id: number, data: KpiMetricRequest) =>
    api.put<KpiMetric>(`/kpis/${id}`, data),
  delete: (id: number) => api.delete(`/kpis/${id}`),
};

// Forecasts
export const forecastsApi = {
  getAll: (planId?: number) =>
    api.get<ForecastEntry[]>("/forecasts", {
      params: planId ? { planId } : undefined,
    }),
  create: (data: ForecastEntryRequest) =>
    api.post<ForecastEntry>("/forecasts", data),
  update: (id: number, data: ForecastEntryRequest) =>
    api.put<ForecastEntry>(`/forecasts/${id}`, data),
  delete: (id: number) => api.delete(`/forecasts/${id}`),
};

//Export the raw axios instance for requests or interceptors.
export default api;
