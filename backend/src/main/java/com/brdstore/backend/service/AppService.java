package com.brdstore.backend.service;

import com.brdstore.backend.audit.AuditService;
import com.brdstore.backend.dto.app.AppResponse;
import com.brdstore.backend.dto.app.CreateAppRequest;
import com.brdstore.backend.dto.app.PermissionMapRequest;
import com.brdstore.backend.dto.app.UpdateAppRequest;
import com.brdstore.backend.entity.*;
import com.brdstore.backend.entity.enums.AppStatus;
import com.brdstore.backend.entity.enums.AuditAction;
import com.brdstore.backend.exception.ApiException;
import com.brdstore.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AppService {

    private final AppRepository appRepository;
    private final PartnerRepository partnerRepository;
    private final ContentRatingRepository contentRatingRepository;
    private final AppCategoryRepository appCategoryRepository;
    private final AppCategoryMapRepository categoryMapRepository;
    private final GeographyRepository geographyRepository;
    private final AppGeographyMapRepository geographyMapRepository;
    private final AppPermissionRepository appPermissionRepository;
    private final AppPermissionMapRepository permissionMapRepository;
    private final TagRepository tagRepository;
    private final AppTagMapRepository tagMapRepository;
    private final AppScreenshotRepository screenshotRepository;
    private final AppStatsRepository appStatsRepository;
    private final FileStorageService fileStorageService;
    private final AuditService auditService;

    public AppService(AppRepository appRepository, PartnerRepository partnerRepository,
                       ContentRatingRepository contentRatingRepository, AppCategoryRepository appCategoryRepository,
                       AppCategoryMapRepository categoryMapRepository, GeographyRepository geographyRepository,
                       AppGeographyMapRepository geographyMapRepository, AppPermissionRepository appPermissionRepository,
                       AppPermissionMapRepository permissionMapRepository, TagRepository tagRepository,
                       AppTagMapRepository tagMapRepository, AppScreenshotRepository screenshotRepository,
                       AppStatsRepository appStatsRepository, FileStorageService fileStorageService,
                       AuditService auditService) {
        this.appRepository = appRepository;
        this.partnerRepository = partnerRepository;
        this.contentRatingRepository = contentRatingRepository;
        this.appCategoryRepository = appCategoryRepository;
        this.categoryMapRepository = categoryMapRepository;
        this.geographyRepository = geographyRepository;
        this.geographyMapRepository = geographyMapRepository;
        this.appPermissionRepository = appPermissionRepository;
        this.permissionMapRepository = permissionMapRepository;
        this.tagRepository = tagRepository;
        this.tagMapRepository = tagMapRepository;
        this.screenshotRepository = screenshotRepository;
        this.appStatsRepository = appStatsRepository;
        this.fileStorageService = fileStorageService;
        this.auditService = auditService;
    }

    @Transactional
    public AppResponse create(UUID partnerId, CreateAppRequest req) {
        Partner partner = partnerRepository.findById(partnerId).orElseThrow(() -> ApiException.notFound("Partner not found"));
        boolean duplicate = appRepository.findAll().stream()
                .anyMatch(a -> a.getOsPlatform() == req.osPlatform() && a.getPackageName().equals(req.packageName()));
        if (duplicate) {
            throw ApiException.conflict("Package name already registered for this platform");
        }

        App app = new App();
        app.setPartner(partner);
        app.setOsPlatform(req.osPlatform());
        app.setPackageName(req.packageName());
        app.setName(req.name());
        app.setShortDesc(req.shortDesc());
        app.setFullDesc(req.fullDesc());
        app.setSupportEmail(req.supportEmail());
        app.setSupportPhone(req.supportPhone());
        app.setWebsiteUrl(req.websiteUrl());
        app.setPrivacyPolicyUrl(req.privacyPolicyUrl());
        if (req.priceType() != null) app.setPriceType(req.priceType());
        if (req.priceVnd() != null) app.setPriceVnd(req.priceVnd());
        app.setAppSignatureHash(req.appSignatureHash());
        if (req.isGlobalAccess() != null) app.setIsGlobalAccess(req.isGlobalAccess());
        if (req.contentRatingId() != null) {
            app.setContentRating(contentRatingRepository.findById(req.contentRatingId())
                    .orElseThrow(() -> ApiException.badRequest("Invalid content rating")));
        }
        app.setStatus(AppStatus.DRAFT);
        app = appRepository.save(app);

        AppStats stats = new AppStats();
        stats.setApp(app);
        stats.setAppId(app.getId());
        appStatsRepository.save(stats);

        auditService.log(AuditAction.CREATE, "apps", app.getId().toString(), null, AppResponse.from(app));
        return AppResponse.from(app);
    }

    @Transactional
    public AppResponse update(UUID appId, UpdateAppRequest req) {
        App app = getOrThrow(appId);
        AppResponse before = AppResponse.from(app);

        if (req.name() != null) app.setName(req.name());
        if (req.shortDesc() != null) app.setShortDesc(req.shortDesc());
        if (req.fullDesc() != null) app.setFullDesc(req.fullDesc());
        if (req.supportEmail() != null) app.setSupportEmail(req.supportEmail());
        if (req.supportPhone() != null) app.setSupportPhone(req.supportPhone());
        if (req.websiteUrl() != null) app.setWebsiteUrl(req.websiteUrl());
        if (req.privacyPolicyUrl() != null) app.setPrivacyPolicyUrl(req.privacyPolicyUrl());
        if (req.priceType() != null) app.setPriceType(req.priceType());
        if (req.priceVnd() != null) app.setPriceVnd(req.priceVnd());
        if (req.appSignatureHash() != null) app.setAppSignatureHash(req.appSignatureHash());
        if (req.isGlobalAccess() != null) app.setIsGlobalAccess(req.isGlobalAccess());
        if (req.contentRatingId() != null) {
            app.setContentRating(contentRatingRepository.findById(req.contentRatingId())
                    .orElseThrow(() -> ApiException.badRequest("Invalid content rating")));
        }
        app = appRepository.save(app);

        boolean financial = req.priceType() != null || req.priceVnd() != null;
        auditService.log(financial ? AuditAction.FINANCIAL_CHANGE : AuditAction.UPDATE,
                "apps", appId.toString(), before, AppResponse.from(app));
        return AppResponse.from(app);
    }

    public AppResponse get(UUID id) {
        return AppResponse.from(getOrThrow(id));
    }

    public List<AppResponse> listByPartner(UUID partnerId) {
        return appRepository.findByPartnerId(partnerId).stream().map(AppResponse::from).toList();
    }

    public List<AppResponse> listPublished() {
        return appRepository.findByStatus(AppStatus.APPROVED).stream().map(AppResponse::from).toList();
    }

    public List<AppResponse> listAll(AppStatus status) {
        List<App> apps = status != null ? appRepository.findByStatus(status) : appRepository.findAll();
        return apps.stream().map(AppResponse::from).toList();
    }

    @Transactional
    public AppResponse submitForApproval(UUID appId) {
        App app = getOrThrow(appId);
        if (app.getStatus() != AppStatus.DRAFT) {
            throw ApiException.badRequest("Only DRAFT apps can be submitted for approval");
        }
        AppStatus old = app.getStatus();
        app.setStatus(AppStatus.PENDING_APPROVAL);
        appRepository.save(app);
        auditService.log(AuditAction.STATUS_CHANGE, "apps", appId.toString(), old, app.getStatus());
        return AppResponse.from(app);
    }

    @Transactional
    public AppResponse approve(UUID appId) {
        App app = getOrThrow(appId);
        if (app.getStatus() != AppStatus.PENDING_APPROVAL) {
            throw ApiException.badRequest("Only PENDING_APPROVAL apps can be approved");
        }
        AppStatus old = app.getStatus();
        app.setStatus(AppStatus.APPROVED);
        appRepository.save(app);
        auditService.log(AuditAction.STATUS_CHANGE, "apps", appId.toString(), old, app.getStatus());
        return AppResponse.from(app);
    }

    @Transactional
    public AppResponse reject(UUID appId, String reason) {
        App app = getOrThrow(appId);
        if (app.getStatus() != AppStatus.PENDING_APPROVAL) {
            throw ApiException.badRequest("Only PENDING_APPROVAL apps can be rejected");
        }
        AppStatus old = app.getStatus();
        app.setStatus(AppStatus.REJECTED);
        appRepository.save(app);
        auditService.log(AuditAction.STATUS_CHANGE, "apps", appId.toString(), old, app.getStatus() + " reason=" + reason);
        return AppResponse.from(app);
    }

    @Transactional
    public AppResponse suspend(UUID appId, String reason) {
        App app = getOrThrow(appId);
        if (app.getStatus() != AppStatus.APPROVED) {
            throw ApiException.badRequest("Only APPROVED apps can be suspended");
        }
        AppStatus old = app.getStatus();
        app.setStatus(AppStatus.SUSPENDED);
        appRepository.save(app);
        auditService.log(AuditAction.STATUS_CHANGE, "apps", appId.toString(), old, app.getStatus() + " reason=" + reason);
        return AppResponse.from(app);
    }

    @Transactional
    public void setCategories(UUID appId, Set<Integer> categoryIds) {
        App app = getOrThrow(appId);
        categoryMapRepository.deleteByAppId(appId);
        for (Integer catId : categoryIds) {
            AppCategory category = appCategoryRepository.findById(catId)
                    .orElseThrow(() -> ApiException.badRequest("Invalid category id: " + catId));
            AppCategoryMap map = new AppCategoryMap();
            map.setApp(app);
            map.setCategory(category);
            AppCategoryMap.Id id = new AppCategoryMap.Id();
            id.setAppId(appId);
            id.setCategoryId(catId);
            map.setId(id);
            categoryMapRepository.save(map);
        }
        auditService.log(AuditAction.UPDATE, "app_category_map", appId.toString(), null, categoryIds);
    }

    @Transactional
    public void setGeographies(UUID appId, Set<String> geoCodes) {
        App app = getOrThrow(appId);
        geographyMapRepository.deleteByAppId(appId);
        for (String code : geoCodes) {
            Geography geo = geographyRepository.findById(code)
                    .orElseThrow(() -> ApiException.badRequest("Invalid geography code: " + code));
            AppGeographyMap map = new AppGeographyMap();
            map.setApp(app);
            map.setGeography(geo);
            AppGeographyMap.Id id = new AppGeographyMap.Id();
            id.setAppId(appId);
            id.setGeographyCode(code);
            map.setId(id);
            geographyMapRepository.save(map);
        }
        auditService.log(AuditAction.UPDATE, "app_geography_map", appId.toString(), null, geoCodes);
    }

    @Transactional
    public void setTags(UUID appId, Set<String> tagNames) {
        App app = getOrThrow(appId);
        tagMapRepository.deleteByAppId(appId);
        for (String name : tagNames) {
            Tag tag = tagRepository.findByName(name).orElseGet(() -> {
                Tag t = new Tag();
                t.setName(name);
                return tagRepository.save(t);
            });
            AppTagMap map = new AppTagMap();
            map.setApp(app);
            map.setTag(tag);
            AppTagMap.Id id = new AppTagMap.Id();
            id.setAppId(appId);
            id.setTagId(tag.getId());
            map.setId(id);
            tagMapRepository.save(map);
        }
        auditService.log(AuditAction.UPDATE, "app_tag_map", appId.toString(), null, tagNames);
    }

    @Transactional
    public void setPermissions(UUID appId, List<PermissionMapRequest> permissions) {
        App app = getOrThrow(appId);
        permissionMapRepository.deleteByAppId(appId);
        for (PermissionMapRequest req : permissions) {
            AppPermission permission = appPermissionRepository.findById(req.permissionId())
                    .orElseThrow(() -> ApiException.badRequest("Invalid permission id: " + req.permissionId()));
            if (Boolean.TRUE.equals(permission.getIsSensitive())
                    && (req.justification() == null || req.justification().isBlank())) {
                throw ApiException.badRequest("Justification required for sensitive permission: " + permission.getCode());
            }
            AppPermissionMap map = new AppPermissionMap();
            map.setApp(app);
            map.setPermission(permission);
            map.setJustification(req.justification());
            AppPermissionMap.Id id = new AppPermissionMap.Id();
            id.setAppId(appId);
            id.setPermissionId(req.permissionId());
            map.setId(id);
            permissionMapRepository.save(map);
        }
        auditService.log(AuditAction.UPDATE, "app_permission_map", appId.toString(), null, permissions.size() + " permissions");
    }

    @Transactional
    public String addScreenshot(UUID appId, MultipartFile file, Integer displayOrder) {
        App app = getOrThrow(appId);
        FileStorageService.StoredFile stored = fileStorageService.store(file, "screenshots/" + appId);
        AppScreenshot screenshot = new AppScreenshot();
        screenshot.setApp(app);
        screenshot.setImageUrl(stored.url());
        screenshot.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        screenshotRepository.save(screenshot);
        auditService.log(AuditAction.CREATE, "app_screenshots", appId.toString(), null, stored.url());
        return stored.url();
    }

    @Transactional
    public String uploadLogo(UUID appId, MultipartFile file) {
        App app = getOrThrow(appId);
        FileStorageService.StoredFile stored = fileStorageService.store(file, "logos/" + appId);
        app.setLogoUrl(stored.url());
        appRepository.save(app);
        return stored.url();
    }

    @Transactional
    public String uploadBanner(UUID appId, MultipartFile file) {
        App app = getOrThrow(appId);
        FileStorageService.StoredFile stored = fileStorageService.store(file, "banners/" + appId);
        app.setBannerUrl(stored.url());
        appRepository.save(app);
        return stored.url();
    }

    App getOrThrow(UUID id) {
        return appRepository.findById(id).orElseThrow(() -> ApiException.notFound("App not found"));
    }
}
