package com.sap.gtmplanning.controller;

import com.sap.gtmplanning.dto.KpiMetricDto;
import com.sap.gtmplanning.service.KpiMetricService;

import javax.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kpis")
@RequiredArgsConstructor
public class KpiMetricController {

    private final KpiMetricService kpiService;

    @GetMapping
    public ResponseEntity<List<KpiMetricDto.Response>> getAllKpis(
            @RequestParam(required = false) Long planId) {
        if (planId != null) {
            return ResponseEntity.ok(kpiService.getKpisByPlan(planId));
        }
        return ResponseEntity.ok(kpiService.getAllKpis());
    }

    @GetMapping("/{id}")
    public ResponseEntity<KpiMetricDto.Response> getKpiById(@PathVariable Long id) {
        return ResponseEntity.ok(kpiService.getKpiById(id));
    }

    @PostMapping
    public ResponseEntity<KpiMetricDto.Response> createKpi(@Valid @RequestBody KpiMetricDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(kpiService.createKpi(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KpiMetricDto.Response> updateKpi(
            @PathVariable Long id,
            @Valid @RequestBody KpiMetricDto.Request request) {
        return ResponseEntity.ok(kpiService.updateKpi(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKpi(@PathVariable Long id) {
        kpiService.deleteKpi(id);
        return ResponseEntity.noContent().build();
    }
}
