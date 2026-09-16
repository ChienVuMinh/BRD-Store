package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppCategoryMap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppCategoryMapRepository extends JpaRepository<AppCategoryMap, AppCategoryMap.Id> {
    List<AppCategoryMap> findByAppId(UUID appId);
    void deleteByAppId(UUID appId);
}
