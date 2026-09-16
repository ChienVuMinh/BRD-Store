package com.brdstore.backend.dto.app;

import com.brdstore.backend.entity.App;
import com.brdstore.backend.entity.enums.AppPriceType;
import com.brdstore.backend.entity.enums.AppStatus;
import com.brdstore.backend.entity.enums.OsPlatform;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AppResponse(
        UUID id,
        UUID partnerId,
        OsPlatform osPlatform,
        String packageName,
        String name,
        String shortDesc,
        String fullDesc,
        String logoUrl,
        String bannerUrl,
        Integer contentRatingId,
        String supportEmail,
        String supportPhone,
        String websiteUrl,
        String privacyPolicyUrl,
        AppPriceType priceType,
        BigDecimal priceVnd,
        String appSignatureHash,
        Boolean isGlobalAccess,
        AppStatus status,
        OffsetDateTime createdAt
) {
    public static AppResponse from(App a) {
        return new AppResponse(
                a.getId(), a.getPartner().getId(), a.getOsPlatform(), a.getPackageName(), a.getName(),
                a.getShortDesc(), a.getFullDesc(), a.getLogoUrl(), a.getBannerUrl(),
                a.getContentRating() != null ? a.getContentRating().getId() : null,
                a.getSupportEmail(), a.getSupportPhone(), a.getWebsiteUrl(), a.getPrivacyPolicyUrl(),
                a.getPriceType(), a.getPriceVnd(), a.getAppSignatureHash(), a.getIsGlobalAccess(),
                a.getStatus(), a.getCreatedAt()
        );
    }
}
