package com.brdstore.backend.service;

import com.brdstore.backend.audit.AuditService;
import com.brdstore.backend.dto.common.InstallRequest;
import com.brdstore.backend.dto.review.CreateReviewRequest;
import com.brdstore.backend.dto.review.ReviewResponse;
import com.brdstore.backend.entity.*;
import com.brdstore.backend.entity.enums.AuditAction;
import com.brdstore.backend.entity.enums.NotificationType;
import com.brdstore.backend.exception.ApiException;
import com.brdstore.backend.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ConsumerAppService {

    private final AppRepository appRepository;
    private final AppVersionRepository versionRepository;
    private final ConsumerRepository consumerRepository;
    private final AppInstallRepository installRepository;
    private final AppReviewRepository reviewRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public ConsumerAppService(AppRepository appRepository, AppVersionRepository versionRepository,
                               ConsumerRepository consumerRepository, AppInstallRepository installRepository,
                               AppReviewRepository reviewRepository, AuditService auditService,
                               NotificationService notificationService) {
        this.appRepository = appRepository;
        this.versionRepository = versionRepository;
        this.consumerRepository = consumerRepository;
        this.installRepository = installRepository;
        this.reviewRepository = reviewRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional
    public void install(UUID appId, UUID consumerId, InstallRequest req, HttpServletRequest httpRequest) {
        App app = appRepository.findById(appId).orElseThrow(() -> ApiException.notFound("App not found"));
        AppVersion version = versionRepository.findById(req.versionId())
                .orElseThrow(() -> ApiException.notFound("Version not found"));
        Consumer consumer = consumerRepository.findById(consumerId).orElseThrow(() -> ApiException.notFound("Consumer not found"));

        AppInstall install = new AppInstall();
        install.setApp(app);
        install.setVersion(version);
        install.setConsumer(consumer);
        install.setDeviceId(req.deviceId());
        install.setIpAddress(httpRequest != null ? httpRequest.getRemoteAddr() : null);
        installRepository.save(install);

        auditService.log(AuditAction.CREATE, "app_installs", String.valueOf(install.getId()), null, appId);
    }

    @Transactional
    public ReviewResponse addReview(UUID appId, UUID consumerId, CreateReviewRequest req) {
        App app = appRepository.findById(appId).orElseThrow(() -> ApiException.notFound("App not found"));
        Consumer consumer = consumerRepository.findById(consumerId).orElseThrow(() -> ApiException.notFound("Consumer not found"));

        if (reviewRepository.existsByAppIdAndConsumerId(appId, consumerId)) {
            throw ApiException.conflict("You have already reviewed this app");
        }

        AppReview review = new AppReview();
        review.setApp(app);
        review.setConsumer(consumer);
        review.setRating(req.rating());
        review.setComment(req.comment());
        review.setUpdatedAt(OffsetDateTime.now());
        review = reviewRepository.save(review);

        auditService.log(AuditAction.CREATE, "app_reviews", review.getId().toString(), null, ReviewResponse.from(review));
        return ReviewResponse.from(review);
    }

    @Transactional
    public ReviewResponse updateReview(UUID reviewId, UUID consumerId, CreateReviewRequest req) {
        AppReview review = getReviewOrThrow(reviewId);
        if (!review.getConsumer().getId().equals(consumerId)) {
            throw ApiException.forbidden("Not your review");
        }
        ReviewResponse before = ReviewResponse.from(review);
        review.setRating(req.rating());
        review.setComment(req.comment());
        review.setUpdatedAt(OffsetDateTime.now());
        review = reviewRepository.save(review);
        auditService.log(AuditAction.UPDATE, "app_reviews", reviewId.toString(), before, ReviewResponse.from(review));
        return ReviewResponse.from(review);
    }

    @Transactional
    public ReviewResponse developerReply(UUID reviewId, String reply) {
        AppReview review = getReviewOrThrow(reviewId);
        review.setDeveloperReply(reply);
        review.setUpdatedAt(OffsetDateTime.now());
        review = reviewRepository.save(review);

        auditService.log(AuditAction.UPDATE, "app_reviews", reviewId.toString(), null, "developer_reply added");
        notificationService.notifyConsumer(review.getConsumer(), NotificationType.DEVELOPER_REPLY,
                "Developer replied to your review", reply);
        return ReviewResponse.from(review);
    }

    @Transactional
    public ReviewResponse setHidden(UUID reviewId, boolean hidden) {
        AppReview review = getReviewOrThrow(reviewId);
        Boolean old = review.getIsHidden();
        review.setIsHidden(hidden);
        review = reviewRepository.save(review);
        auditService.log(AuditAction.STATUS_CHANGE, "app_reviews", reviewId.toString(), old, hidden);
        return ReviewResponse.from(review);
    }

    public List<ReviewResponse> listVisibleReviews(UUID appId) {
        return reviewRepository.findByAppIdAndIsHiddenFalse(appId).stream().map(ReviewResponse::from).toList();
    }

    public List<ReviewResponse> listAllReviews(UUID appId) {
        return reviewRepository.findByAppId(appId).stream().map(ReviewResponse::from).toList();
    }

    private AppReview getReviewOrThrow(UUID id) {
        return reviewRepository.findById(id).orElseThrow(() -> ApiException.notFound("Review not found"));
    }
}
