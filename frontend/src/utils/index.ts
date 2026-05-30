import type { PlanStatus, MetricStatus } from "../types";

export const formatCurrency = (value: number, currency = "EUR"): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

export const planStatusVariant = (status: PlanStatus): string => {
  const map: Record<PlanStatus, string> = {
    DRAFT: "secondary",
    ACTIVE: "success",
    ON_HOLD: "warning",
    COMPLETED: "primary",
    CANCELLED: "danger",
  };
  return map[status] || "secondary";
};

export const metricStatusVariant = (status: MetricStatus): string => {
  const map: Record<MetricStatus, string> = {
    ON_TRACK: "success",
    AT_RISK: "warning",
    BEHIND: "danger",
    ACHIEVED: "primary",
  };
  return map[status] || "secondary";
};

export const REGIONS = [
  "EMEA",
  "APAC",
  "Americas",
  "NA",
  "LATAM",
  "MEE",
  "Global",
];
export const PRODUCTS = [
  "SAP S/4HANA Cloud",
  "SAP BTP",
  "SAP SuccessFactors",
  "SAP Ariba",
  "SAP Concur",
  "SAP CX",
  "Other",
];
export const KPI_CATEGORIES = [
  "Financial",
  "Customer",
  "Pipeline",
  "Marketing",
  "Operational",
  "Strategic",
];
