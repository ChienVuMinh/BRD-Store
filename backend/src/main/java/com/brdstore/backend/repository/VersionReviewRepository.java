package com.brdstore.backend.repository;

import com.brdstore.backend.entity.VersionReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VersionReviewRepository extends JpaRepository<VersionReview, UUID> {
    List<VersionReview> findByVersionId(UUID versionId);
}
