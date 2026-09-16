package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AppStatsRepository extends JpaRepository<AppStats, UUID> {
}
