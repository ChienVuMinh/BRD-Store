package com.brdstore.backend.repository;

import com.brdstore.backend.entity.App;
import com.brdstore.backend.entity.enums.AppStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface AppRepository extends JpaRepository<App, UUID>, JpaSpecificationExecutor<App> {
    List<App> findByPartnerId(UUID partnerId);
    List<App> findByStatus(AppStatus status);
}
