package com.brdstore.backend.dto.app;

import com.brdstore.backend.entity.enums.AppPriceType;
import com.brdstore.backend.entity.enums.OsPlatform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateAppRequest(
        @NotNull OsPlatform osPlatform,
        @NotBlank String packageName,
        @NotBlank String name,
        String shortDesc,
        String fullDesc,
        Integer contentRatingId,
        String supportEmail,
        String supportPhone,
        String websiteUrl,
        String privacyPolicyUrl,
        AppPriceType priceType,
        BigDecimal priceVnd,
        String appSignatureHash,
        Boolean isGlobalAccess
) {
}
