package com.brdstore.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "app_stats")
@Getter
@Setter
public class AppStats {

    @Id
    @Column(name = "app_id")
    private UUID appId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "app_id")
    private App app;

    @Column(name = "total_downloads")
    private Long totalDownloads = 0L;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
