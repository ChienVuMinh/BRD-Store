package com.brdstore.backend.dto.audit;

import com.brdstore.backend.entity.AuditLog;

import java.time.OffsetDateTime;

public record AuditLogResponse(
        Long id,
        String userId,
        String action,
        String targetEntity,
        String targetEntityId,
        String oldValue,
        String newValue,
        String ipAddress,
        OffsetDateTime createdAt
) {
    public static AuditLogResponse from(AuditLog a) {
        return new AuditLogResponse(
                a.getId(),
                a.getUser() != null ? a.getUser().getId().toString() : null,
                a.getAction(), a.getTargetEntity(), a.getTargetEntityId(),
                a.getOldValue(), a.getNewValue(), a.getIpAddress(), a.getCreatedAt()
        );
    }
}
