package com.sap.gtmplanning.repository;

import com.sap.gtmplanning.model.ForecastEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForecastEntryRepository extends JpaRepository<ForecastEntry, Long> {

    List<ForecastEntry> findByPlanId(Long planId);

    List<ForecastEntry> findByPlanIdAndMetricName(Long planId, String metricName);

    List<ForecastEntry> findByPlanIdOrderByPeriodAsc(Long planId);
}
