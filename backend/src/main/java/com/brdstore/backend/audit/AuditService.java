package com.brdstore.backend.audit;

import com.brdstore.backend.entity.AuditLog;
import com.brdstore.backend.entity.User;
import com.brdstore.backend.entity.enums.AuditAction;
import com.brdstore.backend.repository.AuditLogRepository;
import com.brdstore.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditLogRepository auditLogRepository, UserRepository userRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public void log(AuditAction action, String targetEntity, String targetEntityId, Object oldValue, Object newValue) {
        AuditLog entry = new AuditLog();
        entry.setAction(action.name());
        entry.setTargetEntity(targetEntity);
        entry.setTargetEntityId(targetEntityId);
        entry.setOldValue(toJson(oldValue));
        entry.setNewValue(toJson(newValue));
        entry.setIpAddress(currentIp());
        currentUserId().flatMap(userRepository::findById).ifPresent(entry::setUser);
        auditLogRepository.save(entry);
    }

    private String toJson(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "{\"error\":\"serialization failed\"}";
        }
    }

    private java.util.Optional<UUID> currentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.brdstore.backend.security.AuthPrincipal principal
                    && "USER".equals(principal.getPrincipalType())) {
                return java.util.Optional.of(principal.getId());
            }
        } catch (Exception ignored) {
        }
        return java.util.Optional.empty();
    }

    private String currentIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            HttpServletRequest request = attrs.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            return forwarded != null ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }
}
