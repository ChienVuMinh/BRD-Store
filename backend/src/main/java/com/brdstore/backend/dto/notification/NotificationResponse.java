package com.brdstore.backend.dto.notification;

import com.brdstore.backend.entity.Notification;
import com.brdstore.backend.entity.enums.NotificationType;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String message,
        Boolean isRead,
        OffsetDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getTitle(), n.getMessage(), n.getIsRead(), n.getCreatedAt());
    }
}
