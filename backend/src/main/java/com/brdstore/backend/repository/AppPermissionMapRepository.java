package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppPermissionMap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppPermissionMapRepository extends JpaRepository<AppPermissionMap, AppPermissionMap.Id> {
    List<AppPermissionMap> findByAppId(UUID appId);
    void deleteByAppId(UUID appId);
}
