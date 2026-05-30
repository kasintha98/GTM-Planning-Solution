package com.sap.gtmplanning.dto;

import javax.validation.constraints.*;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ForecastEntryDto {

    @Data
    public static class Request {
        @NotNull
        private Long planId;

        @NotBlank
        private String period;

        @NotBlank
        private String metricName;

        @NotNull
        private BigDecimal forecastedValue;

        private BigDecimal actualValue;

        @NotBlank
        private String unit;
    }

    @Data
    public static class Response {
        private Long id;
        private Long planId;
        private String planName;
        private String period;
        private String metricName;
        private BigDecimal forecastedValue;
        private BigDecimal actualValue;
        private String unit;
        private Double variance;
        private LocalDateTime createdAt;
    }
}
