package com.sap.gtmplanning.model;

import javax.persistence.*;
import javax.validation.constraints.*;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecast_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private GtmPlan plan;

    @NotBlank
    private String period;

    @NotBlank
    private String metricName;

    @NotNull
    @Column(precision = 15, scale = 2)
    private BigDecimal forecastedValue;

    @Column(precision = 15, scale = 2)
    private BigDecimal actualValue;

    @NotBlank
    private String unit;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
