package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppVersion;
import com.brdstore.backend.entity.enums.VersionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppVersionRepository extends JpaRepository<AppVersion, UUID> {
    List<AppVersion> findByAppId(UUID appId);
    List<AppVersion> findByAppIdAndStatus(UUID appId, VersionStatus status);
    Optional<AppVersion> findTopByAppIdOrderByBuildNumberDesc(UUID appId);
    List<AppVersion> findByStatus(VersionStatus status);
}
