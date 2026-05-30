package com.sap.gtmplanning.dto;

import com.sap.gtmplanning.model.KpiMetric;

import javax.validation.constraints.*;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class KpiMetricDto {

    @Data
    public static class Request {
        @NotNull(message = "Plan ID is required")
        private Long planId;

        @NotBlank(message = "Metric name is required")
        private String metricName;

        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Target value is required")
        @DecimalMin(value = "0.0")
        private BigDecimal targetValue;

        private BigDecimal actualValue;

        @NotBlank(message = "Unit is required")
        private String unit;

        @NotBlank(message = "Period is required")
        private String period;

        private KpiMetric.MetricStatus status;
    }

    @Data
    public static class Response {
        private Long id;
        private Long planId;
        private String planName;
        private String metricName;
        private String category;
        private BigDecimal targetValue;
        private BigDecimal actualValue;
        private String unit;
        private String period;
        private KpiMetric.MetricStatus status;
        private Double achievementRate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
