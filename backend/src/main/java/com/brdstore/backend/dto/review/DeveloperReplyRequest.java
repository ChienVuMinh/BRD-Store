package com.brdstore.backend.dto.review;

import jakarta.validation.constraints.NotBlank;

public record DeveloperReplyRequest(
        @NotBlank String reply
) {
}
