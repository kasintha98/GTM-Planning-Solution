package com.sap.gtmplanning.repository;

import com.sap.gtmplanning.model.KpiMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KpiMetricRepository extends JpaRepository<KpiMetric, Long> {

    List<KpiMetric> findByPlanId(Long planId);

    List<KpiMetric> findByStatus(KpiMetric.MetricStatus status);

    @Query("SELECT k FROM KpiMetric k WHERE k.plan.id = :planId AND k.status = :status")
    List<KpiMetric> findByPlanIdAndStatus(Long planId, KpiMetric.MetricStatus status);

    @Query("SELECT COUNT(k) FROM KpiMetric k WHERE k.status = :status")
    long countByStatus(KpiMetric.MetricStatus status);
}
