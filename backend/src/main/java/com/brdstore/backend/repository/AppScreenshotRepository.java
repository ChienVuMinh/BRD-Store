package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppScreenshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppScreenshotRepository extends JpaRepository<AppScreenshot, Integer> {
    List<AppScreenshot> findByAppIdOrderByDisplayOrderAsc(UUID appId);
}
