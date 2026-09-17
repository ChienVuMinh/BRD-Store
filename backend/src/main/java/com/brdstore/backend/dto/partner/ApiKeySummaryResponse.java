package com.brdstore.backend.dto.partner;

import com.brdstore.backend.entity.PartnerApiKey;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ApiKeySummaryResponse(
        UUID id,
        String keyName,
        boolean isActive,
        OffsetDateTime createdAt
) {
    public static ApiKeySummaryResponse from(PartnerApiKey key) {
        return new ApiKeySummaryResponse(key.getId(), key.getKeyName(), key.getIsActive(), key.getCreatedAt());
    }
}
