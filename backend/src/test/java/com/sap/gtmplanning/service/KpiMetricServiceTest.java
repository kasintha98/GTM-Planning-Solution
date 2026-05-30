package com.sap.gtmplanning.service;

import com.sap.gtmplanning.dto.KpiMetricDto;
import com.sap.gtmplanning.model.GtmPlan;
import com.sap.gtmplanning.model.KpiMetric;
import com.sap.gtmplanning.repository.GtmPlanRepository;
import com.sap.gtmplanning.repository.KpiMetricRepository;
import javax.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("KpiMetricService Unit Tests")
class KpiMetricServiceTest {

    @Mock
    private KpiMetricRepository kpiRepository;

    @Mock
    private GtmPlanRepository planRepository;

    @InjectMocks
    private KpiMetricService kpiService;

    private GtmPlan plan;
    private KpiMetric sampleKpi;
    private KpiMetricDto.Request sampleRequest;

    @BeforeEach
    void setUp() {
        plan = GtmPlan.builder()
                .id(1L)
                .name("EMEA Cloud Expansion 2026")
                .region("EMEA")
                .product("SAP S/4HANA Cloud")
                .status(GtmPlan.PlanStatus.ACTIVE)
                .budget(new BigDecimal("500000.00"))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .owner("Jane Smith")
                .build();

        sampleKpi = KpiMetric.builder()
                .id(1L)
                .plan(plan)
                .metricName("Revenue Growth")
                .category("Financial")
                .targetValue(new BigDecimal("100000.00"))
                .actualValue(new BigDecimal("85000.00"))
                .unit("EUR")
                .period("Q1 2026")
                .status(KpiMetric.MetricStatus.AT_RISK)
                .build();

        sampleRequest = new KpiMetricDto.Request();
        sampleRequest.setPlanId(1L);
        sampleRequest.setMetricName("Revenue Growth");
        sampleRequest.setCategory("Financial");
        sampleRequest.setTargetValue(new BigDecimal("100000.00"));
        sampleRequest.setActualValue(new BigDecimal("85000.00"));
        sampleRequest.setUnit("EUR");
        sampleRequest.setPeriod("Q1 2026");
    }

    @Test
    @DisplayName("Should return all KPIs for a plan")
    void getKpisByPlan_shouldReturnKpis() {
        when(kpiRepository.findByPlanId(1L)).thenReturn(Arrays.asList(sampleKpi));

        List<KpiMetricDto.Response> result = kpiService.getKpisByPlan(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMetricName()).isEqualTo("Revenue Growth");
        assertThat(result.get(0).getPlanName()).isEqualTo("EMEA Cloud Expansion 2026");
    }

    @Test
    @DisplayName("Should calculate achievement rate correctly")
    void getKpiById_shouldCalculateAchievementRate() {
        when(kpiRepository.findById(1L)).thenReturn(Optional.of(sampleKpi));

        KpiMetricDto.Response result = kpiService.getKpiById(1L);

        assertThat(result.getAchievementRate()).isNotNull();
        assertThat(result.getAchievementRate()).isCloseTo(85.0, within(0.01));
    }

    @Test
    @DisplayName("Should create KPI successfully")
    void createKpi_shouldPersistAndReturn() {
        when(planRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(kpiRepository.save(any(KpiMetric.class))).thenReturn(sampleKpi);

        KpiMetricDto.Response result = kpiService.createKpi(sampleRequest);

        assertThat(result.getMetricName()).isEqualTo("Revenue Growth");
        assertThat(result.getCategory()).isEqualTo("Financial");
        verify(kpiRepository).save(any(KpiMetric.class));
    }

    @Test
    @DisplayName("Should throw when creating KPI for non-existent plan")
    void createKpi_withInvalidPlanId_shouldThrow() {
        when(planRepository.findById(99L)).thenReturn(Optional.empty());
        sampleRequest.setPlanId(99L);

        assertThatThrownBy(() -> kpiService.createKpi(sampleRequest))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("Should delete KPI when found")
    void deleteKpi_whenExists_shouldDelete() {
        when(kpiRepository.findById(1L)).thenReturn(Optional.of(sampleKpi));

        kpiService.deleteKpi(1L);

        verify(kpiRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Achievement rate is null when actual value is not set")
    void getKpiById_withoutActualValue_shouldHaveNullAchievementRate() {
        sampleKpi.setActualValue(null);
        when(kpiRepository.findById(1L)).thenReturn(Optional.of(sampleKpi));

        KpiMetricDto.Response result = kpiService.getKpiById(1L);

        assertThat(result.getAchievementRate()).isNull();
    }
}
