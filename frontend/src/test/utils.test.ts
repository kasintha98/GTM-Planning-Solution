import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatPercent,
  planStatusVariant,
  metricStatusVariant,
} from "../utils";
import type { PlanStatus, MetricStatus } from "../types";

describe("formatCurrency", () => {
  it("formats EUR values correctly", () => {
    const result = formatCurrency(500000, "EUR");
    expect(result).toContain("500,000");
  });

  it("formats USD values correctly", () => {
    const result = formatCurrency(1250000, "USD");
    expect(result).toContain("1,250,000");
  });

  it("handles zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

describe("formatPercent", () => {
  it("formats with one decimal place", () => {
    expect(formatPercent(85.5)).toBe("85.5%");
  });

  it("handles zero", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("handles 100", () => {
    expect(formatPercent(100)).toBe("100.0%");
  });
});

describe("planStatusVariant", () => {
  const cases: Array<[PlanStatus, string]> = [
    ["ACTIVE", "success"],
    ["DRAFT", "secondary"],
    ["ON_HOLD", "warning"],
    ["COMPLETED", "primary"],
    ["CANCELLED", "danger"],
  ];

  it.each(cases)("returns %s variant for %s status", (status, expected) => {
    expect(planStatusVariant(status)).toBe(expected);
  });
});

describe("metricStatusVariant", () => {
  const cases: Array<[MetricStatus, string]> = [
    ["ON_TRACK", "success"],
    ["AT_RISK", "warning"],
    ["BEHIND", "danger"],
    ["ACHIEVED", "primary"],
  ];

  it.each(cases)("returns %s variant for %s status", (status, expected) => {
    expect(metricStatusVariant(status)).toBe(expected);
  });
});
