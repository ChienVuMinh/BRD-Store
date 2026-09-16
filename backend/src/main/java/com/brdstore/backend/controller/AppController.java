package com.brdstore.backend.controller;

import com.brdstore.backend.dto.app.AppResponse;
import com.brdstore.backend.dto.app.CreateAppRequest;
import com.brdstore.backend.dto.app.PermissionMapRequest;
import com.brdstore.backend.dto.app.UpdateAppRequest;
import com.brdstore.backend.dto.partner.PartnerDecisionRequest;
import com.brdstore.backend.entity.enums.AppStatus;
import com.brdstore.backend.service.AppService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AppController {

    private final AppService appService;

    public AppController(AppService appService) {
        this.appService = appService;
    }

    @PostMapping("/partners/{partnerId}/apps")
    @PreAuthorize("hasRole('P_ADMIN') and @accessGuard.isOwnPartner(#partnerId)")
    public AppResponse create(@PathVariable UUID partnerId, @Valid @RequestBody CreateAppRequest request) {
        return appService.create(partnerId, request);
    }

    @GetMapping("/partners/{partnerId}/apps")
    @PreAuthorize("(@accessGuard.isOwnPartner(#partnerId)) or hasAnyRole('S_ADMIN','O_ADMIN','O_REVIEWER','O_SUPPORT','O_REPORT','O_PARTNER_MANAGER')")
    public List<AppResponse> listByPartner(@PathVariable UUID partnerId) {
        return appService.listByPartner(partnerId);
    }

    @GetMapping("/public/apps")
    public List<AppResponse> listPublished() {
        return appService.listPublished();
    }

    @GetMapping("/apps")
    @PreAuthorize("hasAnyRole('S_ADMIN','O_ADMIN','O_REVIEWER','O_SUPPORT','O_REPORT','O_PARTNER_MANAGER')")
    public List<AppResponse> listAll(@RequestParam(required = false) AppStatus status) {
        return appService.listAll(status);
    }

    @GetMapping("/apps/{id}")
    public AppResponse get(@PathVariable UUID id) {
        return appService.get(id);
    }

    @PutMapping("/apps/{id}")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER') and @accessGuard.isOwnPartnerForApp(#id)")
    public AppResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateAppRequest request) {
        return appService.update(id, request);
    }

    @PostMapping("/apps/{id}/submit")
    @PreAuthorize("hasRole('P_ADMIN') and @accessGuard.isOwnPartnerForApp(#id)")
    public AppResponse submit(@PathVariable UUID id) {
        return appService.submitForApproval(id);
    }

    @PostMapping("/apps/{id}/approve")
    @PreAuthorize("hasAnyRole('O_REVIEWER','O_ADMIN','S_ADMIN')")
    public AppResponse approve(@PathVariable UUID id) {
        return appService.approve(id);
    }

    @PostMapping("/apps/{id}/reject")
    @PreAuthorize("hasAnyRole('O_REVIEWER','O_ADMIN','S_ADMIN')")
    public AppResponse reject(@PathVariable UUID id, @RequestBody PartnerDecisionRequest request) {
        return appService.reject(id, request.reason());
    }

    @PostMapping("/apps/{id}/suspend")
    @PreAuthorize("hasAnyRole('O_ADMIN','S_ADMIN','O_SUPPORT')")
    public AppResponse suspend(@PathVariable UUID id, @RequestBody PartnerDecisionRequest request) {
        return appService.suspend(id, request.reason());
    }

    @PutMapping("/apps/{id}/categories")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER') and @accessGuard.isOwnPartnerForApp(#id)")
    public void setCategories(@PathVariable UUID id, @RequestBody Set<Integer> categoryIds) {
        appService.setCategories(id, categoryIds);
    }

    @PutMapping("/apps/{id}/geographies")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER') and @accessGuard.isOwnPartnerForApp(#id)")
    public void setGeographies(@PathVariable UUID id, @RequestBody Set<String> geoCodes) {
        appService.setGeographies(id, geoCodes);
    }

    @PutMapping("/apps/{id}/tags")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER') and @accessGuard.isOwnPartnerForApp(#id)")
    public void setTags(@PathVariable UUID id, @RequestBody Set<String> tagNames) {
        appService.setTags(id, tagNames);
    }

    @PutMapping("/apps/{id}/permissions")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER') and @accessGuard.isOwnPartnerForApp(#id)")
    public void setPermissions(@PathVariable UUID id, @Valid @RequestBody List<PermissionMapRequest> permissions) {
        appService.setPermissions(id, permissions);
    }

    @PostMapping(value = "/apps/{id}/screenshots", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER') and @accessGuard.isOwnPartnerForApp(#id)")
    public String addScreenshot(@PathVariable UUID id, @RequestParam MultipartFile file,
                                 @RequestParam(required = false) Integer displayOrder) {
        return appService.addScreenshot(id, file, displayOrder);
    }

    @PostMapping(value = "/apps/{id}/logo", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER') and @accessGuard.isOwnPartnerForApp(#id)")
    public String uploadLogo(@PathVariable UUID id, @RequestParam MultipartFile file) {
        return appService.uploadLogo(id, file);
    }

    @PostMapping(value = "/apps/{id}/banner", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER') and @accessGuard.isOwnPartnerForApp(#id)")
    public String uploadBanner(@PathVariable UUID id, @RequestParam MultipartFile file) {
        return appService.uploadBanner(id, file);
    }
}
