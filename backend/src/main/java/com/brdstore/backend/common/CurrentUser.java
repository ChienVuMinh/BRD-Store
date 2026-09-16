package com.brdstore.backend.common;

import com.brdstore.backend.security.AuthPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class CurrentUser {

    public Optional<AuthPrincipal> get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthPrincipal principal)) {
            return Optional.empty();
        }
        return Optional.of(principal);
    }

    public UUID requireId() {
        return get().map(AuthPrincipal::getId)
                .orElseThrow(() -> new IllegalStateException("No authenticated principal"));
    }

    public boolean isConsumer() {
        return get().map(p -> "CONSUMER".equals(p.getPrincipalType())).orElse(false);
    }
}
