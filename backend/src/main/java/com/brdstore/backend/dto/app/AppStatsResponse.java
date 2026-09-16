package com.brdstore.backend.dto.app;

import com.brdstore.backend.entity.AppStats;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AppStatsResponse(
        UUID appId,
        Long totalDownloads,
        BigDecimal averageRating,
        Integer totalReviews,
        OffsetDateTime updatedAt
) {
    public static AppStatsResponse from(AppStats s) {
        return new AppStatsResponse(s.getAppId(), s.getTotalDownloads(), s.getAverageRating(), s.getTotalReviews(), s.getUpdatedAt());
    }
}
