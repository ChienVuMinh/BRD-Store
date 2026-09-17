package com.brdstore.backend.dto.common;

import com.brdstore.backend.entity.AppInstall;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MyInstallResponse(
        UUID appId,
        String appName,
        String logoUrl,
        String versionName,
        OffsetDateTime installedAt
) {
    public static MyInstallResponse from(AppInstall install) {
        return new MyInstallResponse(
                install.getApp().getId(),
                install.getApp().getName(),
                install.getApp().getLogoUrl(),
                install.getVersion() != null ? install.getVersion().getVersionName() : null,
                install.getInstalledAt()
        );
    }
}
