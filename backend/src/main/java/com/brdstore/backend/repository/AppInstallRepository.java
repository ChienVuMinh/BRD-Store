package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppInstall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppInstallRepository extends JpaRepository<AppInstall, Long> {
    List<AppInstall> findByConsumerId(UUID consumerId);
    long countByAppId(UUID appId);
}
