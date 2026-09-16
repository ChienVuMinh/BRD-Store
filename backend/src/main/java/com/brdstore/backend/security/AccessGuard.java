package com.brdstore.backend.security;

import com.brdstore.backend.entity.App;
import com.brdstore.backend.repository.AppRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("accessGuard")
public class AccessGuard {

    private final AppRepository appRepository;

    public AccessGuard(AppRepository appRepository) {
        this.appRepository = appRepository;
    }

    public boolean isOwnPartner(UUID partnerId) {
        AuthPrincipal principal = currentPrincipal();
        return principal != null && principal.getPartnerId() != null && principal.getPartnerId().equals(partnerId);
    }

    public boolean isOwnPartnerForApp(UUID appId) {
        AuthPrincipal principal = currentPrincipal();
        if (principal == null || principal.getPartnerId() == null) return false;
        App app = appRepository.findById(appId).orElse(null);
        return app != null && app.getPartner().getId().equals(principal.getPartnerId());
    }

    private AuthPrincipal currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthPrincipal principal) {
            return principal;
        }
        return null;
    }
}
