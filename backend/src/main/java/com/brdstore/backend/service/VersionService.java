package com.brdstore.backend.service;

import com.brdstore.backend.audit.AuditService;
import com.brdstore.backend.dto.version.CreateVersionRequest;
import com.brdstore.backend.dto.version.VersionResponse;
import com.brdstore.backend.entity.*;
import com.brdstore.backend.entity.enums.*;
import com.brdstore.backend.exception.ApiException;
import com.brdstore.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class VersionService {

    private final AppVersionRepository versionRepository;
    private final AppRepository appRepository;
    private final UserRepository userRepository;
    private final VersionReviewRepository versionReviewRepository;
    private final FileStorageService fileStorageService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public VersionService(AppVersionRepository versionRepository, AppRepository appRepository,
                           UserRepository userRepository, VersionReviewRepository versionReviewRepository,
                           FileStorageService fileStorageService, AuditService auditService,
                           NotificationService notificationService) {
        this.versionRepository = versionRepository;
        this.appRepository = appRepository;
        this.userRepository = userRepository;
        this.versionReviewRepository = versionReviewRepository;
        this.fileStorageService = fileStorageService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional
    public VersionResponse create(UUID appId, CreateVersionRequest req, UUID uploaderId, MultipartFile file) {
        App app = appRepository.findById(appId).orElseThrow(() -> ApiException.notFound("App not found"));
        Long nextBuild = versionRepository.findTopByAppIdOrderByBuildNumberDesc(appId)
                .map(v -> v.getBuildNumber() + 1)
                .orElse(1L);

        AppVersion version = new AppVersion();
        version.setApp(app);
        version.setVersionName(req.versionName());
        version.setBuildNumber(nextBuild);
        version.setMinSdkVersion(req.minSdkVersion());
        version.setTargetSdkVersion(req.targetSdkVersion());
        version.setSupportedArchitectures(req.supportedArchitectures());
        version.setReleaseNotes(req.releaseNotes());
        version.setStatus(VersionStatus.DRAFT);
        userRepository.findById(uploaderId).ifPresent(version::setUploadedBy);

        if (file != null && !file.isEmpty()) {
            FileStorageService.StoredFile stored = fileStorageService.store(file, "builds/" + appId);
            version.setFileUrl(stored.url());
            version.setFileSizeBytes(stored.sizeBytes());
            version.setFileHashSha256(stored.sha256());
        }

        version = versionRepository.save(version);
        auditService.log(AuditAction.CREATE, "app_versions", version.getId().toString(), null, VersionResponse.from(version));
        return VersionResponse.from(version);
    }

    @Transactional
    public VersionResponse replaceBuild(UUID versionId, MultipartFile file) {
        AppVersion version = getOrThrow(versionId);
        if (version.getStatus() != VersionStatus.DRAFT) {
            throw ApiException.badRequest("Build file can only be replaced while version is DRAFT");
        }
        FileStorageService.StoredFile stored = fileStorageService.store(file, "builds/" + version.getApp().getId());
        version.setFileUrl(stored.url());
        version.setFileSizeBytes(stored.sizeBytes());
        version.setFileHashSha256(stored.sha256());
        versionRepository.save(version);
        return VersionResponse.from(version);
    }

    @Transactional
    public VersionResponse submit(UUID versionId) {
        AppVersion version = getOrThrow(versionId);
        if (version.getStatus() != VersionStatus.DRAFT) {
            throw ApiException.badRequest("Only DRAFT versions can be submitted for internal testing");
        }
        if (version.getFileUrl() == null) {
            throw ApiException.badRequest("Build file must be uploaded before submitting");
        }
        VersionStatus old = version.getStatus();
        version.setStatus(VersionStatus.SUBMIT);
        versionRepository.save(version);
        auditService.log(AuditAction.STATUS_CHANGE, "app_versions", versionId.toString(), old, version.getStatus());
        return VersionResponse.from(version);
    }

    @Transactional
    public VersionResponse sendToReview(UUID versionId) {
        AppVersion version = getOrThrow(versionId);
        if (version.getStatus() != VersionStatus.SUBMIT) {
            throw ApiException.badRequest("Only SUBMIT versions can be sent to review");
        }
        VersionStatus old = version.getStatus();
        version.setStatus(VersionStatus.IN_REVIEW);
        versionRepository.save(version);
        auditService.log(AuditAction.STATUS_CHANGE, "app_versions", versionId.toString(), old, version.getStatus());
        return VersionResponse.from(version);
    }

    @Transactional
    public VersionResponse review(UUID versionId, UUID reviewerId, ReviewAction action, String rejectionReason, String notes) {
        AppVersion version = getOrThrow(versionId);
        if (version.getStatus() != VersionStatus.IN_REVIEW) {
            throw ApiException.badRequest("Only IN_REVIEW versions can be reviewed");
        }
        if (action == ReviewAction.REJECTED && (rejectionReason == null || rejectionReason.isBlank())) {
            throw ApiException.badRequest("Rejection reason is required");
        }

        User reviewer = userRepository.findById(reviewerId).orElseThrow(() -> ApiException.notFound("Reviewer not found"));

        VersionReview review = new VersionReview();
        review.setVersion(version);
        review.setReviewer(reviewer);
        review.setAction(action);
        review.setRejectionReason(rejectionReason);
        review.setReviewNotes(notes);
        versionReviewRepository.save(review);

        VersionStatus old = version.getStatus();
        version.setStatus(action == ReviewAction.APPROVED ? VersionStatus.APPROVED : VersionStatus.REJECTED);
        versionRepository.save(version);

        auditService.log(AuditAction.STATUS_CHANGE, "app_versions", versionId.toString(), old, version.getStatus());

        User uploader = version.getUploadedBy();
        String message = action == ReviewAction.APPROVED
                ? "Version " + version.getVersionName() + " was approved."
                : "Version " + version.getVersionName() + " was rejected. Reason: " + rejectionReason;
        notificationService.notifyUser(uploader, NotificationType.VERSION_STATUS_CHANGE, "Version review result", message);

        return VersionResponse.from(version);
    }

    @Transactional
    public VersionResponse publish(UUID versionId) {
        AppVersion version = getOrThrow(versionId);
        if (version.getStatus() != VersionStatus.APPROVED) {
            throw ApiException.badRequest("Only APPROVED versions can be published");
        }
        if (version.getApp().getStatus() != AppStatus.APPROVED) {
            throw ApiException.badRequest("App must be APPROVED before publishing a version");
        }

        // Auto-archive previously published versions of the same app so exactly one
        // PUBLISHED version exists at a time (BRD: "Version cu tu dong luu tru").
        versionRepository.findByAppIdAndStatus(version.getApp().getId(), VersionStatus.PUBLISHED)
                .forEach(old -> {
                    old.setStatus(VersionStatus.ARCHIVED);
                    versionRepository.save(old);
                    auditService.log(AuditAction.STATUS_CHANGE, "app_versions", old.getId().toString(),
                            VersionStatus.PUBLISHED, VersionStatus.ARCHIVED);
                });

        VersionStatus old = version.getStatus();
        version.setStatus(VersionStatus.PUBLISHED);
        versionRepository.save(version);
        auditService.log(AuditAction.STATUS_CHANGE, "app_versions", versionId.toString(), old, version.getStatus());
        return VersionResponse.from(version);
    }

    public List<VersionResponse> listByApp(UUID appId) {
        return versionRepository.findByAppId(appId).stream().map(VersionResponse::from).toList();
    }

    public List<VersionResponse> listAll(VersionStatus status) {
        List<AppVersion> versions = status != null ? versionRepository.findByStatus(status) : versionRepository.findAll();
        return versions.stream().map(VersionResponse::from).toList();
    }

    public VersionResponse get(UUID id) {
        return VersionResponse.from(getOrThrow(id));
    }

    AppVersion getOrThrow(UUID id) {
        return versionRepository.findById(id).orElseThrow(() -> ApiException.notFound("Version not found"));
    }
}
