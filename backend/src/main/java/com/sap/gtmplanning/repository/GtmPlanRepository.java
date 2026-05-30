package com.sap.gtmplanning.repository;

import com.sap.gtmplanning.model.GtmPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GtmPlanRepository extends JpaRepository<GtmPlan, Long> {

    List<GtmPlan> findByStatus(GtmPlan.PlanStatus status);

    List<GtmPlan> findByRegion(String region);

    List<GtmPlan> findByOwner(String owner);

    @Query("SELECT p FROM GtmPlan p WHERE p.status = 'ACTIVE' ORDER BY p.startDate ASC")
    List<GtmPlan> findActivePlans();

    @Query("SELECT COUNT(p) FROM GtmPlan p WHERE p.status = :status")
    long countByStatus(GtmPlan.PlanStatus status);
}
