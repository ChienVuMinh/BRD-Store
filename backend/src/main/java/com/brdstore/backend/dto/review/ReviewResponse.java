package com.brdstore.backend.dto.review;

import com.brdstore.backend.entity.AppReview;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID appId,
        UUID consumerId,
        Integer rating,
        String comment,
        String developerReply,
        Boolean isHidden,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static ReviewResponse from(AppReview r) {
        return new ReviewResponse(
                r.getId(), r.getApp().getId(), r.getConsumer().getId(), r.getRating(), r.getComment(),
                r.getDeveloperReply(), r.getIsHidden(), r.getCreatedAt(), r.getUpdatedAt()
        );
    }
}
