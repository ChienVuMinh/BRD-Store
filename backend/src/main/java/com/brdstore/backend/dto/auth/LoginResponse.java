package com.brdstore.backend.dto.auth;

import java.util.List;

public record LoginResponse(
        String token,
        String principalType,
        String id,
        String username,
        List<String> roles
) {
}
