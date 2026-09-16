package com.brdstore.backend.dto.app;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PermissionMapRequest(
        @NotNull Integer permissionId,
        @NotBlank String justification
) {
}
