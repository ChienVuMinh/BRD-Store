package com.brdstore.backend.dto.common;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record InstallRequest(
        @NotNull UUID versionId,
        String deviceId
) {
}
