package com.sap.gtmplanning.service;

import com.sap.gtmplanning.dto.GtmPlanDto;
import com.sap.gtmplanning.model.GtmPlan;
import com.sap.gtmplanning.repository.GtmPlanRepository;
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
@DisplayName("GtmPlanService Unit Tests")
class GtmPlanServiceTest {

    @Mock
    private GtmPlanRepository planRepository;

    @InjectMocks
    private GtmPlanService planService;

    private GtmPlan samplePlan;
    private GtmPlanDto.Request sampleRequest;

    @BeforeEach
    void setUp() {
        samplePlan = GtmPlan.builder()
                .id(1L)
                .name("EMEA Cloud Expansion 2026")
                .description("Expand cloud product offerings in EMEA market")
                .region("EMEA")
                .product("SAP S/4HANA Cloud")
                .status(GtmPlan.PlanStatus.ACTIVE)
                .budget(new BigDecimal("500000.00"))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .owner("Jane Smith")
                .build();

        sampleRequest = new GtmPlanDto.Request();
        sampleRequest.setName("EMEA Cloud Expansion 2026");
        sampleRequest.setDescription("Expand cloud product offerings in EMEA market");
        sampleRequest.setRegion("EMEA");
        sampleRequest.setProduct("SAP S/4HANA Cloud");
        sampleRequest.setStatus(GtmPlan.PlanStatus.ACTIVE);
        sampleRequest.setBudget(new BigDecimal("500000.00"));
        sampleRequest.setStartDate(LocalDate.of(2026, 1, 1));
        sampleRequest.setEndDate(LocalDate.of(2026, 12, 31));
        sampleRequest.setOwner("Jane Smith");
    }

    @Test
    @DisplayName("Should return all plans")
    void getAllPlans_shouldReturnAllPlans() {
        when(planRepository.findAll()).thenReturn(Arrays.asList(samplePlan));

        List<GtmPlanDto.Response> result = planService.getAllPlans();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("EMEA Cloud Expansion 2026");
        assertThat(result.get(0).getRegion()).isEqualTo("EMEA");
        verify(planRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return plan by ID when exists")
    void getPlanById_whenExists_shouldReturnPlan() {
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));

        GtmPlanDto.Response result = planService.getPlanById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("EMEA Cloud Expansion 2026");
        assertThat(result.getStatus()).isEqualTo(GtmPlan.PlanStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when plan not found")
    void getPlanById_whenNotExists_shouldThrow() {
        when(planRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> planService.getPlanById(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Should create a new plan with DRAFT status by default")
    void createPlan_withoutStatus_shouldDefaultToDraft() {
        sampleRequest.setStatus(null);
        GtmPlan savedPlan = GtmPlan.builder()
                .id(2L)
                .name(sampleRequest.getName())
                .region(sampleRequest.getRegion())
                .product(sampleRequest.getProduct())
                .status(GtmPlan.PlanStatus.DRAFT)
                .budget(sampleRequest.getBudget())
                .startDate(sampleRequest.getStartDate())
                .endDate(sampleRequest.getEndDate())
                .owner(sampleRequest.getOwner())
                .build();
        when(planRepository.save(any(GtmPlan.class))).thenReturn(savedPlan);

        GtmPlanDto.Response result = planService.createPlan(sampleRequest);

        assertThat(result.getStatus()).isEqualTo(GtmPlan.PlanStatus.DRAFT);
        verify(planRepository).save(any(GtmPlan.class));
    }

    @Test
    @DisplayName("Should create a plan with specified status")
    void createPlan_withStatus_shouldUseSpecifiedStatus() {
        when(planRepository.save(any(GtmPlan.class))).thenReturn(samplePlan);

        GtmPlanDto.Response result = planService.createPlan(sampleRequest);

        assertThat(result.getStatus()).isEqualTo(GtmPlan.PlanStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should update an existing plan")
    void updatePlan_whenExists_shouldUpdateFields() {
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));
        sampleRequest.setName("Updated Plan Name");
        samplePlan.setName("Updated Plan Name");
        when(planRepository.save(any(GtmPlan.class))).thenReturn(samplePlan);

        GtmPlanDto.Response result = planService.updatePlan(1L, sampleRequest);

        assertThat(result.getName()).isEqualTo("Updated Plan Name");
        verify(planRepository).save(samplePlan);
    }

    @Test
    @DisplayName("Should delete plan when exists")
    void deletePlan_whenExists_shouldDelete() {
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));

        planService.deletePlan(1L);

        verify(planRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should return summary with correct counts")
    void getSummary_shouldReturnCorrectSummary() {
        when(planRepository.findAll()).thenReturn(Arrays.asList(samplePlan));
        when(planRepository.countByStatus(GtmPlan.PlanStatus.ACTIVE)).thenReturn(1L);
        when(planRepository.countByStatus(GtmPlan.PlanStatus.COMPLETED)).thenReturn(0L);
        when(planRepository.countByStatus(GtmPlan.PlanStatus.DRAFT)).thenReturn(0L);
        when(planRepository.countByStatus(GtmPlan.PlanStatus.ON_HOLD)).thenReturn(0L);
        when(planRepository.countByStatus(GtmPlan.PlanStatus.CANCELLED)).thenReturn(0L);

        GtmPlanDto.Summary summary = planService.getSummary();

        assertThat(summary.getTotalPlans()).isEqualTo(1);
        assertThat(summary.getActivePlans()).isEqualTo(1);
        assertThat(summary.getTotalBudget()).isEqualByComparingTo(new BigDecimal("500000.00"));
        assertThat(summary.getStatusBreakdown()).hasSize(5);
        assertThat(summary.getStatusBreakdown())
                .extracting(GtmPlanDto.Summary.StatusBreakdown::getStatus, GtmPlanDto.Summary.StatusBreakdown::getCount)
                .containsExactly(
                        tuple(GtmPlan.PlanStatus.DRAFT, 0L),
                        tuple(GtmPlan.PlanStatus.ACTIVE, 1L),
                        tuple(GtmPlan.PlanStatus.ON_HOLD, 0L),
                        tuple(GtmPlan.PlanStatus.COMPLETED, 0L),
                        tuple(GtmPlan.PlanStatus.CANCELLED, 0L));
        assertThat(summary.getByRegion()).hasSize(1);
        assertThat(summary.getByRegion().get(0).getRegion()).isEqualTo("EMEA");
    }
}
