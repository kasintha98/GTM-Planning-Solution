export type PlanStatus =
  | "DRAFT"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type MetricStatus = "ON_TRACK" | "AT_RISK" | "BEHIND" | "ACHIEVED";

export interface GtmPlan {
  id: number;
  name: string;
  description?: string;
  region: string;
  product: string;
  status: PlanStatus;
  budget: number;
  startDate: string;
  endDate: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  kpiCount: number;
  kpiAchievementRate: number;
}

export interface GtmPlanRequest {
  name: string;
  description?: string;
  region: string;
  product: string;
  status?: PlanStatus;
  budget: number;
  startDate: string;
  endDate: string;
  owner: string;
}

export interface KpiMetric {
  id: number;
  planId: number;
  planName: string;
  metricName: string;
  category: string;
  targetValue: number;
  actualValue?: number;
  unit: string;
  period: string;
  status: MetricStatus;
  achievementRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KpiMetricRequest {
  planId: number;
  metricName: string;
  category: string;
  targetValue: number;
  actualValue?: number;
  unit: string;
  period: string;
  status?: MetricStatus;
}

export interface ForecastEntry {
  id: number;
  planId: number;
  planName: string;
  period: string;
  metricName: string;
  forecastedValue: number;
  actualValue?: number;
  unit: string;
  variance?: number;
  createdAt: string;
}

export interface ForecastEntryRequest {
  planId: number;
  period: string;
  metricName: string;
  forecastedValue: number;
  actualValue?: number;
  unit: string;
}

export interface PlanSummary {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  draftPlans: number;
  totalBudget: number;
  statusBreakdown: PlanStatusBreakdown[];
  byRegion: RegionBreakdown[];
}

export interface PlanStatusBreakdown {
  status: PlanStatus;
  count: number;
}

export interface RegionBreakdown {
  region: string;
  count: number;
  budget: number;
}
