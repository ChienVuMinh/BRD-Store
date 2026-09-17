package com.brdstore.backend.controller;

import com.brdstore.backend.common.CurrentUser;
import com.brdstore.backend.dto.partner.ApiKeyResponse;
import com.brdstore.backend.dto.partner.ApiKeySummaryResponse;
import com.brdstore.backend.dto.partner.PartnerDecisionRequest;
import com.brdstore.backend.dto.partner.PartnerRegisterRequest;
import com.brdstore.backend.dto.partner.PartnerResponse;
import com.brdstore.backend.dto.user.CreatePartnerUserRequest;
import com.brdstore.backend.dto.user.UserResponse;
import com.brdstore.backend.entity.enums.PartnerStatus;
import com.brdstore.backend.service.PartnerService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/partners")
public class PartnerController {

    private final PartnerService partnerService;
    private final CurrentUser currentUser;

    public PartnerController(PartnerService partnerService, CurrentUser currentUser) {
        this.partnerService = partnerService;
        this.currentUser = currentUser;
    }

    @PostMapping("/register")
    public PartnerResponse register(@Valid @RequestBody PartnerRegisterRequest request) {
        return partnerService.register(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('S_ADMIN','O_ADMIN','O_PARTNER_MANAGER','O_SUPPORT','O_REPORT')")
    public List<PartnerResponse> list(@RequestParam(required = false) PartnerStatus status) {
        return partnerService.list(status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('S_ADMIN','O_ADMIN','O_PARTNER_MANAGER','O_SUPPORT','O_REPORT') or @accessGuard.isOwnPartner(#id)")
    public PartnerResponse get(@PathVariable UUID id) {
        return partnerService.get(id);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('O_PARTNER_MANAGER','O_ADMIN','S_ADMIN')")
    public PartnerResponse approve(@PathVariable UUID id) {
        return partnerService.approve(id);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('O_PARTNER_MANAGER','O_ADMIN','S_ADMIN')")
    public PartnerResponse reject(@PathVariable UUID id, @RequestBody PartnerDecisionRequest request) {
        return partnerService.reject(id, request.reason());
    }

    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasAnyRole('O_PARTNER_MANAGER','O_ADMIN','S_ADMIN')")
    public PartnerResponse suspend(@PathVariable UUID id, @RequestBody PartnerDecisionRequest request) {
        return partnerService.suspend(id, request.reason());
    }

    @PostMapping("/{id}/users")
    @PreAuthorize("hasRole('P_ADMIN') and @accessGuard.isOwnPartner(#id)")
    public UserResponse createUser(@PathVariable UUID id, @Valid @RequestBody CreatePartnerUserRequest request) {
        return partnerService.createPartnerUser(id, request);
    }

    @GetMapping("/{id}/users")
    @PreAuthorize("(hasRole('P_ADMIN') and @accessGuard.isOwnPartner(#id)) or hasAnyRole('S_ADMIN','O_ADMIN','O_PARTNER_MANAGER','O_SUPPORT')")
    public List<UserResponse> listUsers(@PathVariable UUID id) {
        return partnerService.listPartnerUsers(id);
    }

    @PostMapping("/{id}/api-keys")
    @PreAuthorize("hasRole('P_ADMIN') and @accessGuard.isOwnPartner(#id)")
    public ApiKeyResponse createApiKey(@PathVariable UUID id, @RequestParam String keyName) {
        return partnerService.createApiKey(id, keyName, currentUser.requireId());
    }

    @GetMapping("/{id}/api-keys")
    @PreAuthorize("hasRole('P_ADMIN') and @accessGuard.isOwnPartner(#id)")
    public List<ApiKeySummaryResponse> listApiKeys(@PathVariable UUID id) {
        return partnerService.listApiKeys(id);
    }

    @DeleteMapping("/{id}/api-keys/{keyId}")
    @PreAuthorize("hasRole('P_ADMIN') and @accessGuard.isOwnPartner(#id)")
    public void revokeApiKey(@PathVariable UUID id, @PathVariable UUID keyId) {
        partnerService.revokeApiKey(id, keyId);
    }
}
