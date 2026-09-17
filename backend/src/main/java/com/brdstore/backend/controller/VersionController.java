package com.brdstore.backend.controller;

import com.brdstore.backend.common.CurrentUser;
import com.brdstore.backend.dto.version.CreateVersionRequest;
import com.brdstore.backend.dto.version.VersionResponse;
import com.brdstore.backend.dto.version.VersionReviewRequest;
import com.brdstore.backend.entity.enums.ReviewAction;
import com.brdstore.backend.entity.enums.VersionStatus;
import com.brdstore.backend.service.VersionService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class VersionController {

    private final VersionService versionService;
    private final CurrentUser currentUser;

    public VersionController(VersionService versionService, CurrentUser currentUser) {
        this.versionService = versionService;
        this.currentUser = currentUser;
    }

    @PostMapping(value = "/apps/{appId}/versions", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER') and @accessGuard.isOwnPartnerForApp(#appId)")
    public VersionResponse create(@PathVariable UUID appId,
                                   @RequestParam String versionName,
                                   @RequestParam(required = false) String minSdkVersion,
                                   @RequestParam(required = false) String targetSdkVersion,
                                   @RequestParam(required = false) String supportedArchitectures,
                                   @RequestParam(required = false) String releaseNotes,
                                   @RequestParam(required = false) MultipartFile file) {
        CreateVersionRequest req = new CreateVersionRequest(versionName, minSdkVersion, targetSdkVersion, supportedArchitectures, releaseNotes);
        return versionService.create(appId, req, currentUser.requireId(), file);
    }

    @PostMapping(value = "/versions/{id}/build", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER')")
    public VersionResponse replaceBuild(@PathVariable UUID id, @RequestParam MultipartFile file) {
        return versionService.replaceBuild(id, file);
    }

    @GetMapping("/apps/{appId}/versions")
    public List<VersionResponse> listByApp(@PathVariable UUID appId) {
        return versionService.listByApp(appId);
    }

    @GetMapping("/apps/{appId}/published-version")
    public VersionResponse getPublishedVersion(@PathVariable UUID appId) {
        return versionService.getPublishedVersion(appId);
    }

    @GetMapping("/versions")
    @PreAuthorize("hasAnyRole('S_ADMIN','O_ADMIN','O_REVIEWER','O_SUPPORT','O_REPORT')")
    public List<VersionResponse> listAll(@RequestParam(required = false) VersionStatus status) {
        return versionService.listAll(status);
    }

    @GetMapping("/versions/{id}")
    public VersionResponse get(@PathVariable UUID id) {
        return versionService.get(id);
    }

    @PostMapping("/versions/{id}/submit")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER')")
    public VersionResponse submit(@PathVariable UUID id) {
        return versionService.submit(id);
    }

    @PostMapping("/versions/{id}/send-to-review")
    @PreAuthorize("hasRole('P_ADMIN')")
    public VersionResponse sendToReview(@PathVariable UUID id) {
        return versionService.sendToReview(id);
    }

    @PostMapping("/versions/{id}/review-approve")
    @PreAuthorize("hasAnyRole('O_REVIEWER','O_ADMIN','S_ADMIN')")
    public VersionResponse reviewApprove(@PathVariable UUID id, @RequestBody(required = false) VersionReviewRequest request) {
        String notes = request != null ? request.reviewNotes() : null;
        return versionService.review(id, currentUser.requireId(), ReviewAction.APPROVED, null, notes);
    }

    @PostMapping("/versions/{id}/review-reject")
    @PreAuthorize("hasAnyRole('O_REVIEWER','O_ADMIN','S_ADMIN')")
    public VersionResponse reviewReject(@PathVariable UUID id, @Valid @RequestBody VersionReviewRequest request) {
        return versionService.review(id, currentUser.requireId(), ReviewAction.REJECTED, request.rejectionReason(), request.reviewNotes());
    }

    @PostMapping("/versions/{id}/publish")
    @PreAuthorize("hasRole('P_ADMIN')")
    public VersionResponse publish(@PathVariable UUID id) {
        return versionService.publish(id);
    }
}
