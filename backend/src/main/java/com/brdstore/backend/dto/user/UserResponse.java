package com.brdstore.backend.dto.user;

import com.brdstore.backend.entity.User;
import com.brdstore.backend.entity.enums.UserStatus;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record UserResponse(
        UUID id,
        String username,
        String email,
        String fullName,
        UUID partnerId,
        UserStatus status,
        Set<String> roles,
        OffsetDateTime createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(), u.getUsername(), u.getEmail(), u.getFullName(),
                u.getPartner() != null ? u.getPartner().getId() : null,
                u.getStatus(),
                u.getRoles().stream().map(com.brdstore.backend.entity.Role::getCode).collect(Collectors.toSet()),
                u.getCreatedAt()
        );
    }
}
