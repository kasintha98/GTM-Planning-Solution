package com.sap.gtmplanning.model;

import javax.persistence.*;
import javax.validation.constraints.*;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "kpi_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KpiMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private GtmPlan plan;

    @NotBlank(message = "Metric name is required")
    @Column(nullable = false)
    private String metricName;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Target value is required")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal targetValue;

    @Column(precision = 15, scale = 2)
    private BigDecimal actualValue;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotBlank(message = "Period is required")
    private String period;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MetricStatus status = MetricStatus.ON_TRACK;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum MetricStatus {
        ON_TRACK, AT_RISK, BEHIND, ACHIEVED
    }
}
