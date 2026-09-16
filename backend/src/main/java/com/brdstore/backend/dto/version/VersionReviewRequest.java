package com.brdstore.backend.dto.version;

public record VersionReviewRequest(
        String rejectionReason,
        String reviewNotes
) {
}
