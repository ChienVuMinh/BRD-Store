package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppCategoryRepository extends JpaRepository<AppCategory, Integer> {
}
