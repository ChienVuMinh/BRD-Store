package com.brdstore.backend.dto.version;

import com.brdstore.backend.entity.AppVersion;
import com.brdstore.backend.entity.enums.VersionStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record VersionResponse(
        UUID id,
        UUID appId,
        String versionName,
        Long buildNumber,
        String fileUrl,
        Long fileSizeBytes,
        String fileHashSha256,
        String minSdkVersion,
        String targetSdkVersion,
        String supportedArchitectures,
        String releaseNotes,
        VersionStatus status,
        OffsetDateTime createdAt
) {
    public static VersionResponse from(AppVersion v) {
        return new VersionResponse(
                v.getId(), v.getApp().getId(), v.getVersionName(), v.getBuildNumber(),
                v.getFileUrl(), v.getFileSizeBytes(), v.getFileHashSha256(),
                v.getMinSdkVersion(), v.getTargetSdkVersion(), v.getSupportedArchitectures(),
                v.getReleaseNotes(), v.getStatus(), v.getCreatedAt()
        );
    }
}
