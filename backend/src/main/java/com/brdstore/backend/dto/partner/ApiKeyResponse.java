package com.brdstore.backend.dto.partner;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ApiKeyResponse(
        UUID id,
        String keyName,
        String plainKey,
        boolean isActive,
        OffsetDateTime createdAt
) {
}
