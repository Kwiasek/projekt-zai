package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.dto.DashboardStatsDTO;
import com.kwiasek.sklep_backend.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class StatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardStatsDTO getStats() {
        return statsService.getDashboardStats();
    }
}
