package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppPermission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppPermissionRepository extends JpaRepository<AppPermission, Integer> {
}
