package com.sap.gtmplanning.service;

import com.sap.gtmplanning.dto.KpiMetricDto;
import com.sap.gtmplanning.model.GtmPlan;
import com.sap.gtmplanning.model.KpiMetric;
import com.sap.gtmplanning.repository.GtmPlanRepository;
import com.sap.gtmplanning.repository.KpiMetricRepository;

import javax.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KpiMetricService {

    private final KpiMetricRepository kpiRepository;
    private final GtmPlanRepository planRepository;

    public List<KpiMetricDto.Response> getAllKpis() {
        return kpiRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<KpiMetricDto.Response> getKpisByPlan(Long planId) {
        return kpiRepository.findByPlanId(planId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public KpiMetricDto.Response getKpiById(Long id) {
        return toResponse(findKpiOrThrow(id));
    }

    @Transactional
    public KpiMetricDto.Response createKpi(KpiMetricDto.Request request) {
        GtmPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new EntityNotFoundException("Plan not found: " + request.getPlanId()));

        KpiMetric kpi = KpiMetric.builder()
                .plan(plan)
                .metricName(request.getMetricName())
                .category(request.getCategory())
                .targetValue(request.getTargetValue())
                .actualValue(request.getActualValue())
                .unit(request.getUnit())
                .period(request.getPeriod())
                .status(request.getStatus() != null ? request.getStatus() : KpiMetric.MetricStatus.ON_TRACK)
                .build();
        return toResponse(kpiRepository.save(kpi));
    }

    @Transactional
    public KpiMetricDto.Response updateKpi(Long id, KpiMetricDto.Request request) {
        KpiMetric kpi = findKpiOrThrow(id);
        kpi.setMetricName(request.getMetricName());
        kpi.setCategory(request.getCategory());
        kpi.setTargetValue(request.getTargetValue());
        kpi.setActualValue(request.getActualValue());
        kpi.setUnit(request.getUnit());
        kpi.setPeriod(request.getPeriod());
        if (request.getStatus() != null) kpi.setStatus(request.getStatus());
        return toResponse(kpiRepository.save(kpi));
    }

    @Transactional
    public void deleteKpi(Long id) {
        findKpiOrThrow(id);
        kpiRepository.deleteById(id);
    }

    private KpiMetric findKpiOrThrow(Long id) {
        return kpiRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("KPI not found with id: " + id));
    }

    private KpiMetricDto.Response toResponse(KpiMetric kpi) {
        KpiMetricDto.Response response = new KpiMetricDto.Response();
        response.setId(kpi.getId());
        response.setPlanId(kpi.getPlan().getId());
        response.setPlanName(kpi.getPlan().getName());
        response.setMetricName(kpi.getMetricName());
        response.setCategory(kpi.getCategory());
        response.setTargetValue(kpi.getTargetValue());
        response.setActualValue(kpi.getActualValue());
        response.setUnit(kpi.getUnit());
        response.setPeriod(kpi.getPeriod());
        response.setStatus(kpi.getStatus());
        response.setCreatedAt(kpi.getCreatedAt());
        response.setUpdatedAt(kpi.getUpdatedAt());

        if (kpi.getActualValue() != null && kpi.getTargetValue().compareTo(BigDecimal.ZERO) != 0) {
            double rate = kpi.getActualValue()
                    .divide(kpi.getTargetValue(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            response.setAchievementRate(rate);
        }
        return response;
    }
}
