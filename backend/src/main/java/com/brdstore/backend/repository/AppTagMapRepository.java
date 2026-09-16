package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppTagMap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppTagMapRepository extends JpaRepository<AppTagMap, AppTagMap.Id> {
    List<AppTagMap> findByAppId(UUID appId);
    void deleteByAppId(UUID appId);
}
