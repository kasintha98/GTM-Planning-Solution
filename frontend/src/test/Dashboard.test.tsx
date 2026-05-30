import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Dashboard from "../components/dashboard/Dashboard";
import plansReducer from "../store/slices/plansSlice";
import kpisReducer from "../store/slices/kpisSlice";
import forecastsReducer from "../store/slices/forecastsSlice";
import type { GtmPlan, KpiMetric } from "../types";

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="chart">{children}</div>
  ),
  BarChart: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  Line: () => null,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const mockPlan: GtmPlan = {
  id: 1,
  name: "EMEA Cloud 2026",
  description: "",
  region: "EMEA",
  product: "SAP S/4HANA",
  status: "ACTIVE",
  budget: 500000,
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  owner: "Jane",
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
  kpiCount: 2,
  kpiAchievementRate: 80,
};

const mockKpi: KpiMetric = {
  id: 1,
  planId: 1,
  planName: "EMEA Cloud 2026",
  metricName: "Revenue Growth",
  category: "Financial",
  targetValue: 100000,
  actualValue: 80000,
  unit: "EUR",
  period: "Q1 2026",
  status: "AT_RISK",
  achievementRate: 80,
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
};

function buildStore(plans: GtmPlan[] = [], kpis: KpiMetric[] = []) {
  return configureStore({
    reducer: {
      plans: plansReducer,
      kpis: kpisReducer,
      forecasts: forecastsReducer,
    },
    preloadedState: {
      plans: {
        items: plans,
        summary: {
          totalPlans: plans.length,
          activePlans: 1,
          completedPlans: 0,
          draftPlans: 0,
          totalBudget: 500000,
          statusBreakdown: [
            { status: "DRAFT", count: 0 },
            { status: "ACTIVE", count: 1 },
            { status: "ON_HOLD", count: 0 },
            { status: "COMPLETED", count: 0 },
            { status: "CANCELLED", count: 0 },
          ],
          byRegion: [{ region: "EMEA", count: 1, budget: 500000 }],
        },
        selected: null,
        loading: false,
        error: null,
      },
      kpis: { items: kpis, loading: false, error: null },
      forecasts: { items: [], loading: false, error: null },
    },
  });
}

function renderDashboard(plans: GtmPlan[] = [], kpis: KpiMetric[] = []) {
  const store = buildStore(plans, kpis);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </Provider>,
  );
}

describe("Dashboard", () => {
  it("renders page title", () => {
    renderDashboard();
    expect(screen.getByText("GTM Planning Overview")).toBeInTheDocument();
  });

  it("displays total plans KPI tile", () => {
    renderDashboard([mockPlan]);
    expect(screen.getByText("Total Plans")).toBeInTheDocument();
  });

  it("displays KPIs Tracked tile", () => {
    renderDashboard([mockPlan], [mockKpi]);
    expect(screen.getByText("KPIs Tracked")).toBeInTheDocument();
  });

  it("shows at-risk KPI in attention section", () => {
    renderDashboard([mockPlan], [mockKpi]);
    expect(screen.getByText("KPIs Needing Attention")).toBeInTheDocument();
    expect(screen.getByText("Revenue Growth")).toBeInTheDocument();
  });

  it("shows all-ok message when no at-risk KPIs", () => {
    const okKpi = { ...mockKpi, status: "ON_TRACK" as const };
    renderDashboard([mockPlan], [okKpi]);
    expect(screen.getByText(/All KPIs are on track/)).toBeInTheDocument();
  });

  it("shows recent plans in the table", () => {
    renderDashboard([mockPlan]);
    expect(screen.getByText("EMEA Cloud 2026")).toBeInTheDocument();
  });

  it("shows empty state when no plans", () => {
    renderDashboard([]);
    expect(screen.getByText(/Create your first plan/)).toBeInTheDocument();
  });
});
