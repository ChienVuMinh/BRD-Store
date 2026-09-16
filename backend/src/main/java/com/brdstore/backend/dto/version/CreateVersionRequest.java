package com.brdstore.backend.dto.version;

import jakarta.validation.constraints.NotBlank;

public record CreateVersionRequest(
        @NotBlank String versionName,
        String minSdkVersion,
        String targetSdkVersion,
        String supportedArchitectures,
        String releaseNotes
) {
}
