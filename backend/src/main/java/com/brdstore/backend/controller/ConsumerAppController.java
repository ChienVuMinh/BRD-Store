package com.brdstore.backend.controller;

import com.brdstore.backend.common.CurrentUser;
import com.brdstore.backend.dto.common.InstallRequest;
import com.brdstore.backend.dto.review.CreateReviewRequest;
import com.brdstore.backend.dto.review.DeveloperReplyRequest;
import com.brdstore.backend.dto.review.ReviewResponse;
import com.brdstore.backend.service.ConsumerAppService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/apps/{appId}")
public class ConsumerAppController {

    private final ConsumerAppService consumerAppService;
    private final CurrentUser currentUser;

    public ConsumerAppController(ConsumerAppService consumerAppService, CurrentUser currentUser) {
        this.consumerAppService = consumerAppService;
        this.currentUser = currentUser;
    }

    @PostMapping("/install")
    @PreAuthorize("hasRole('CONSUMER')")
    public void install(@PathVariable UUID appId, @Valid @RequestBody InstallRequest request, HttpServletRequest httpRequest) {
        consumerAppService.install(appId, currentUser.requireId(), request, httpRequest);
    }

    @GetMapping("/reviews")
    public List<ReviewResponse> listReviews(@PathVariable UUID appId) {
        return consumerAppService.listVisibleReviews(appId);
    }

    @GetMapping("/reviews/all")
    @PreAuthorize("hasAnyRole('S_ADMIN','O_ADMIN','O_SUPPORT','P_ADMIN','P_DEVELOPER')")
    public List<ReviewResponse> listAllReviews(@PathVariable UUID appId) {
        return consumerAppService.listAllReviews(appId);
    }

    @PostMapping("/reviews")
    @PreAuthorize("hasRole('CONSUMER')")
    public ReviewResponse addReview(@PathVariable UUID appId, @Valid @RequestBody CreateReviewRequest request) {
        return consumerAppService.addReview(appId, currentUser.requireId(), request);
    }

    @PutMapping("/reviews/{reviewId}")
    @PreAuthorize("hasRole('CONSUMER')")
    public ReviewResponse updateReview(@PathVariable UUID appId, @PathVariable UUID reviewId,
                                        @Valid @RequestBody CreateReviewRequest request) {
        return consumerAppService.updateReview(reviewId, currentUser.requireId(), request);
    }

    @PostMapping("/reviews/{reviewId}/reply")
    @PreAuthorize("hasAnyRole('P_ADMIN','P_DEVELOPER')")
    public ReviewResponse reply(@PathVariable UUID appId, @PathVariable UUID reviewId,
                                 @Valid @RequestBody DeveloperReplyRequest request) {
        return consumerAppService.developerReply(reviewId, request.reply());
    }

    @PostMapping("/reviews/{reviewId}/hide")
    @PreAuthorize("hasAnyRole('O_SUPPORT','O_ADMIN','S_ADMIN')")
    public ReviewResponse hide(@PathVariable UUID appId, @PathVariable UUID reviewId) {
        return consumerAppService.setHidden(reviewId, true);
    }

    @PostMapping("/reviews/{reviewId}/unhide")
    @PreAuthorize("hasAnyRole('O_SUPPORT','O_ADMIN','S_ADMIN')")
    public ReviewResponse unhide(@PathVariable UUID appId, @PathVariable UUID reviewId) {
        return consumerAppService.setHidden(reviewId, false);
    }
}
