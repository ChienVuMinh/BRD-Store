package com.brdstore.backend.repository;

import com.brdstore.backend.entity.Geography;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GeographyRepository extends JpaRepository<Geography, String> {
}
