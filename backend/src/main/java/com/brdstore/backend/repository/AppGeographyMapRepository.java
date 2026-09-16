package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppGeographyMap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppGeographyMapRepository extends JpaRepository<AppGeographyMap, AppGeographyMap.Id> {
    List<AppGeographyMap> findByAppId(UUID appId);
    void deleteByAppId(UUID appId);
}
