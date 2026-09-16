package com.brdstore.backend.dto.app;

import com.brdstore.backend.entity.enums.AppPriceType;

import java.math.BigDecimal;

public record UpdateAppRequest(
        String name,
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
