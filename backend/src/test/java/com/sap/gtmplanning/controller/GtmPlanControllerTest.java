package com.sap.gtmplanning.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sap.gtmplanning.dto.GtmPlanDto;
import com.sap.gtmplanning.model.GtmPlan;
import com.sap.gtmplanning.service.GtmPlanService;
import javax.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GtmPlanController.class)
@DisplayName("GtmPlanController Integration Tests")
class GtmPlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GtmPlanService planService;

    private GtmPlanDto.Response buildSampleResponse() {
        GtmPlanDto.Response r = new GtmPlanDto.Response();
        r.setId(1L);
        r.setName("EMEA Cloud Expansion 2026");
        r.setRegion("EMEA");
        r.setProduct("SAP S/4HANA Cloud");
        r.setStatus(GtmPlan.PlanStatus.ACTIVE);
        r.setBudget(new BigDecimal("500000.00"));
        r.setStartDate(LocalDate.of(2026, 1, 1));
        r.setEndDate(LocalDate.of(2026, 12, 31));
        r.setOwner("Jane Smith");
        return r;
    }

    @Test
    @DisplayName("GET /api/plans returns 200 with list of plans")
    void getAllPlans_returns200() throws Exception {
        when(planService.getAllPlans()).thenReturn(Arrays.asList(buildSampleResponse()));

        mockMvc.perform(get("/api/plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("EMEA Cloud Expansion 2026"))
                .andExpect(jsonPath("$[0].region").value("EMEA"));
    }

    @Test
    @DisplayName("GET /api/plans/{id} returns 200 when plan found")
    void getPlanById_whenFound_returns200() throws Exception {
        when(planService.getPlanById(1L)).thenReturn(buildSampleResponse());

        mockMvc.perform(get("/api/plans/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("GET /api/plans/{id} returns 404 when not found")
    void getPlanById_whenNotFound_returns404() throws Exception {
        when(planService.getPlanById(99L)).thenThrow(new EntityNotFoundException("Plan not found with id: 99"));

        mockMvc.perform(get("/api/plans/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/plans creates plan and returns 201")
    void createPlan_validRequest_returns201() throws Exception {
        GtmPlanDto.Request request = new GtmPlanDto.Request();
        request.setName("APAC Launch 2026");
        request.setRegion("APAC");
        request.setProduct("SAP BTP");
        request.setBudget(new BigDecimal("200000.00"));
        request.setStartDate(LocalDate.of(2026, 3, 1));
        request.setEndDate(LocalDate.of(2026, 9, 30));
        request.setOwner("John Doe");

        GtmPlanDto.Response savedResponse = new GtmPlanDto.Response();
        savedResponse.setId(2L);
        savedResponse.setName("APAC Launch 2026");
        savedResponse.setStatus(GtmPlan.PlanStatus.DRAFT);

        when(planService.createPlan(any())).thenReturn(savedResponse);

        mockMvc.perform(post("/api/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("APAC Launch 2026"));
    }

    @Test
    @DisplayName("POST /api/plans returns 400 when name is blank")
    void createPlan_invalidRequest_returns400() throws Exception {
        GtmPlanDto.Request request = new GtmPlanDto.Request();
        request.setName("");  // invalid
        request.setRegion("EMEA");
        request.setProduct("SAP S/4HANA");
        request.setBudget(new BigDecimal("100000.00"));
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusMonths(6));
        request.setOwner("Jane");

        mockMvc.perform(post("/api/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/plans/{id} returns 204")
    void deletePlan_returns204() throws Exception {
        doNothing().when(planService).deletePlan(1L);

        mockMvc.perform(delete("/api/plans/1"))
                .andExpect(status().isNoContent());
    }
}
