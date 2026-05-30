package com.sap.gtmplanning.controller;

import com.sap.gtmplanning.dto.ForecastEntryDto;
import com.sap.gtmplanning.service.ForecastEntryService;

import javax.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forecasts")
@RequiredArgsConstructor
public class ForecastEntryController {

    private final ForecastEntryService forecastService;

    @GetMapping
    public ResponseEntity<List<ForecastEntryDto.Response>> getAll(
            @RequestParam(required = false) Long planId) {
        if (planId != null) {
            return ResponseEntity.ok(forecastService.getByPlan(planId));
        }
        return ResponseEntity.ok(forecastService.getAll());
    }

    @PostMapping
    public ResponseEntity<ForecastEntryDto.Response> create(
            @Valid @RequestBody ForecastEntryDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(forecastService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ForecastEntryDto.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody ForecastEntryDto.Request request) {
        return ResponseEntity.ok(forecastService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        forecastService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
