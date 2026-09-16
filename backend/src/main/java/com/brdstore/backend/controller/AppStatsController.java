package com.brdstore.backend.controller;

import com.brdstore.backend.dto.app.AppStatsResponse;
import com.brdstore.backend.exception.ApiException;
import com.brdstore.backend.repository.AppStatsRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/apps/{appId}/stats")
public class AppStatsController {

    private final AppStatsRepository appStatsRepository;

    public AppStatsController(AppStatsRepository appStatsRepository) {
        this.appStatsRepository = appStatsRepository;
    }

    @GetMapping
    public AppStatsResponse get(@PathVariable UUID appId) {
        return appStatsRepository.findById(appId)
                .map(AppStatsResponse::from)
                .orElseThrow(() -> ApiException.notFound("Stats not found"));
    }
}
