package com.sap.gtmplanning.controller;

import com.sap.gtmplanning.dto.GtmPlanDto;
import com.sap.gtmplanning.model.GtmPlan;
import com.sap.gtmplanning.service.GtmPlanService;

import javax.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
/**
 * REST controller for GTM Plans.
 * Exposes CRUD endpoints used by the frontend.
 */
public class GtmPlanController {

    private final GtmPlanService planService;

    @GetMapping
    public ResponseEntity<List<GtmPlanDto.Response>> getAllPlans(
            @RequestParam(required = false) GtmPlan.PlanStatus status) {
        //Return all plans or filter by status when provided.
        if (status != null) {
            return ResponseEntity.ok(planService.getPlansByStatus(status));
        }
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GtmPlanDto.Response> getPlanById(@PathVariable Long id) {
        // Fetch a single plan by id (404 if not found)
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    @GetMapping("/summary")
    public ResponseEntity<GtmPlanDto.Summary> getSummary() {
        //Returns aggregate statistics used on the dashboard (counts, budgets)
        return ResponseEntity.ok(planService.getSummary());
    }

    @PostMapping
    public ResponseEntity<GtmPlanDto.Response> createPlan(@Valid @RequestBody GtmPlanDto.Request request) {
        // Create a new plan. Request also validated
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.createPlan(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GtmPlanDto.Response> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody GtmPlanDto.Request request) {
        // Update existing plan fields
        return ResponseEntity.ok(planService.updatePlan(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        // Delete plan and associated relationships
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
