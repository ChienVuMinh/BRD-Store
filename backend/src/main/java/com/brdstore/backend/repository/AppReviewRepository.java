package com.brdstore.backend.repository;

import com.brdstore.backend.entity.AppReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppReviewRepository extends JpaRepository<AppReview, UUID> {
    List<AppReview> findByAppIdAndIsHiddenFalse(UUID appId);
    List<AppReview> findByAppId(UUID appId);
    Optional<AppReview> findByAppIdAndConsumerId(UUID appId, UUID consumerId);
    boolean existsByAppIdAndConsumerId(UUID appId, UUID consumerId);

    @org.springframework.data.jpa.repository.Query(
            "select coalesce(avg(r.rating), 0) from AppReview r where r.app.id = :appId and r.isHidden = false")
    BigDecimal averageRating(UUID appId);

    long countByAppIdAndIsHiddenFalse(UUID appId);
}
