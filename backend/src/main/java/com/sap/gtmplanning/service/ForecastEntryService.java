package com.sap.gtmplanning.service;

import com.sap.gtmplanning.dto.ForecastEntryDto;
import com.sap.gtmplanning.model.ForecastEntry;
import com.sap.gtmplanning.model.GtmPlan;
import com.sap.gtmplanning.repository.ForecastEntryRepository;
import com.sap.gtmplanning.repository.GtmPlanRepository;

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
public class ForecastEntryService {

    private final ForecastEntryRepository forecastRepository;
    private final GtmPlanRepository planRepository;

    public List<ForecastEntryDto.Response> getByPlan(Long planId) {
        return forecastRepository.findByPlanIdOrderByPeriodAsc(planId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ForecastEntryDto.Response> getAll() {
        return forecastRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ForecastEntryDto.Response create(ForecastEntryDto.Request request) {
        GtmPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new EntityNotFoundException("Plan not found: " + request.getPlanId()));

        ForecastEntry entry = ForecastEntry.builder()
                .plan(plan)
                .period(request.getPeriod())
                .metricName(request.getMetricName())
                .forecastedValue(request.getForecastedValue())
                .actualValue(request.getActualValue())
                .unit(request.getUnit())
                .build();
        return toResponse(forecastRepository.save(entry));
    }

    @Transactional
    public ForecastEntryDto.Response update(Long id, ForecastEntryDto.Request request) {
        ForecastEntry entry = forecastRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Forecast not found: " + id));
        entry.setPeriod(request.getPeriod());
        entry.setMetricName(request.getMetricName());
        entry.setForecastedValue(request.getForecastedValue());
        entry.setActualValue(request.getActualValue());
        entry.setUnit(request.getUnit());
        return toResponse(forecastRepository.save(entry));
    }

    @Transactional
    public void delete(Long id) {
        forecastRepository.deleteById(id);
    }

    private ForecastEntryDto.Response toResponse(ForecastEntry entry) {
        ForecastEntryDto.Response r = new ForecastEntryDto.Response();
        r.setId(entry.getId());
        r.setPlanId(entry.getPlan().getId());
        r.setPlanName(entry.getPlan().getName());
        r.setPeriod(entry.getPeriod());
        r.setMetricName(entry.getMetricName());
        r.setForecastedValue(entry.getForecastedValue());
        r.setActualValue(entry.getActualValue());
        r.setUnit(entry.getUnit());
        r.setCreatedAt(entry.getCreatedAt());

        if (entry.getActualValue() != null && entry.getForecastedValue().compareTo(BigDecimal.ZERO) != 0) {
            double variance = entry.getActualValue()
                    .subtract(entry.getForecastedValue())
                    .divide(entry.getForecastedValue(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            r.setVariance(variance);
        }
        return r;
    }
}
