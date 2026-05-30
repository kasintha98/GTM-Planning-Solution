package com.sap.gtmplanning.model;

import javax.persistence.*;
import javax.validation.constraints.*;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gtm_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GtmPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Plan name is required")
    @Size(max = 200)
    @Column(nullable = false)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotBlank(message = "Region is required")
    @Column(nullable = false)
    private String region;

    @NotBlank(message = "Product is required")
    @Column(nullable = false)
    private String product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PlanStatus status = PlanStatus.DRAFT;

    @NotNull(message = "Budget is required")
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal budget;

    @NotNull(message = "Start date is required")
    @Column(nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(nullable = false)
    private LocalDate endDate;

    @NotBlank(message = "Owner is required")
    @Column(nullable = false)
    private String owner;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<KpiMetric> kpiMetrics = new ArrayList<>();

    public enum PlanStatus {
        DRAFT, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
    }
}
