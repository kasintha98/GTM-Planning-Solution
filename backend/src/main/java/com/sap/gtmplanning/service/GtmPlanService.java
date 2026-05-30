package com.sap.gtmplanning.service;

import com.sap.gtmplanning.dto.GtmPlanDto;
import com.sap.gtmplanning.model.GtmPlan;
import com.sap.gtmplanning.model.KpiMetric;
import com.sap.gtmplanning.repository.GtmPlanRepository;

import javax.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GtmPlanService {

    private final GtmPlanRepository planRepository;

    /**
     * Service layer for GTM Plans.
     * Responsible for fetching entities and applying business logic (summary calculations, achievement rates)
     * This also maps domain entities to DTOs consumed by REST controllers.
     */

    public List<GtmPlanDto.Response> getAllPlans() {
        return planRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public GtmPlanDto.Response getPlanById(Long id) {
        GtmPlan plan = findPlanOrThrow(id);
        return toResponse(plan);
    }

    public List<GtmPlanDto.Response> getPlansByStatus(GtmPlan.PlanStatus status) {
        return planRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GtmPlanDto.Response createPlan(GtmPlanDto.Request request) {
        //Build and save a new GTM plan from the incoming DTO.
        GtmPlan plan = GtmPlan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .region(request.getRegion())
                .product(request.getProduct())
                .status(request.getStatus() != null ? request.getStatus() : GtmPlan.PlanStatus.DRAFT)
                .budget(request.getBudget())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .owner(request.getOwner())
                .build();
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public GtmPlanDto.Response updatePlan(Long id, GtmPlanDto.Request request) {
        //Update entity fields from DTO and save. Throws if id not found.
        GtmPlan plan = findPlanOrThrow(id);
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setRegion(request.getRegion());
        plan.setProduct(request.getProduct());
        if (request.getStatus() != null) plan.setStatus(request.getStatus());
        plan.setBudget(request.getBudget());
        plan.setStartDate(request.getStartDate());
        plan.setEndDate(request.getEndDate());
        plan.setOwner(request.getOwner());
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public void deletePlan(Long id) {
        // Ensure the plan exists then delete. Cascade rules manage related entities.
        findPlanOrThrow(id);
        planRepository.deleteById(id);
    }

    public GtmPlanDto.Summary getSummary() {
        //Aggregate summary values used by the dashboard counts, budgets and region breakdowns.
        List<GtmPlan> all = planRepository.findAll();
        GtmPlanDto.Summary summary = new GtmPlanDto.Summary();
        summary.setTotalPlans(all.size());
        summary.setActivePlans(planRepository.countByStatus(GtmPlan.PlanStatus.ACTIVE));
        summary.setCompletedPlans(planRepository.countByStatus(GtmPlan.PlanStatus.COMPLETED));
        summary.setDraftPlans(planRepository.countByStatus(GtmPlan.PlanStatus.DRAFT));

        List<GtmPlanDto.Summary.StatusBreakdown> statusBreakdown = Arrays.stream(GtmPlan.PlanStatus.values())
            .map(status -> {
                GtmPlanDto.Summary.StatusBreakdown breakdown= new GtmPlanDto.Summary.StatusBreakdown();
                breakdown.setStatus(status);
                breakdown.setCount(planRepository.countByStatus(status));
                return breakdown;
            })
            .collect(Collectors.toList());
        summary.setStatusBreakdown(statusBreakdown);

        BigDecimal totalBudget = all.stream()
                .map(GtmPlan::getBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalBudget(totalBudget);

        Map<String, List<GtmPlan>> byRegion = all.stream()
                .collect(Collectors.groupingBy(GtmPlan::getRegion));

        List<GtmPlanDto.Summary.RegionBreakdown> regionBreakdowns = byRegion.entrySet().stream()
                .map(entry -> {
                    GtmPlanDto.Summary.RegionBreakdown rb = new GtmPlanDto.Summary.RegionBreakdown();
                    rb.setRegion(entry.getKey());
                    rb.setCount(entry.getValue().size());
                    rb.setBudget(entry.getValue().stream()
                            .map(GtmPlan::getBudget)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    return rb;
                })
                .collect(Collectors.toList());
        summary.setByRegion(regionBreakdowns);
        return summary;
    }

    private GtmPlan findPlanOrThrow(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("GTM Plan not found with id: " + id));
    }

    private GtmPlanDto.Response toResponse(GtmPlan plan) {
        GtmPlanDto.Response response = new GtmPlanDto.Response();
        response.setId(plan.getId());
        response.setName(plan.getName());
        response.setDescription(plan.getDescription());
        response.setRegion(plan.getRegion());
        response.setProduct(plan.getProduct());
        response.setStatus(plan.getStatus());
        response.setBudget(plan.getBudget());
        response.setStartDate(plan.getStartDate());
        response.setEndDate(plan.getEndDate());
        response.setOwner(plan.getOwner());
        response.setCreatedAt(plan.getCreatedAt());
        response.setUpdatedAt(plan.getUpdatedAt());

        List<KpiMetric> kpis = plan.getKpiMetrics();
        response.setKpiCount(kpis.size());
        if (!kpis.isEmpty()) {
            long achieved = kpis.stream()
                    .filter(k -> k.getStatus() == KpiMetric.MetricStatus.ACHIEVED || k.getStatus() == KpiMetric.MetricStatus.ON_TRACK)
                    .count();
            response.setKpiAchievementRate((double) achieved / kpis.size() * 100);
        }
        return response;
    }
}
