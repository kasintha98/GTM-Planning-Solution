package com.sap.gtmplanning.dto;

import com.sap.gtmplanning.model.GtmPlan;

import javax.validation.constraints.*;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class GtmPlanDto {

    @Data
    public static class Request {
        @NotBlank(message = "Name is required")
        private String name;

        private String description;

        @NotBlank(message = "Region is required")
        private String region;

        @NotBlank(message = "Product is required")
        private String product;

        private GtmPlan.PlanStatus status;

        @NotNull(message = "Budget is required")
        @DecimalMin(value = "0.01", message = "Budget must be greater than 0")
        private BigDecimal budget;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;

        @NotBlank(message = "Owner is required")
        private String owner;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private String region;
        private String product;
        private GtmPlan.PlanStatus status;
        private BigDecimal budget;
        private LocalDate startDate;
        private LocalDate endDate;
        private String owner;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private int kpiCount;
        private double kpiAchievementRate;
    }

    @Data
    public static class Summary {
        private long totalPlans;
        private long activePlans;
        private long completedPlans;
        private long draftPlans;
        private BigDecimal totalBudget;
        private List<StatusBreakdown> statusBreakdown;
        private List<RegionBreakdown> byRegion;

        @Data
        public static class StatusBreakdown {
            private GtmPlan.PlanStatus status;
            private long count;
        }

        @Data
        public static class RegionBreakdown {
            private String region;
            private long count;
            private BigDecimal budget;
        }
    }
}
