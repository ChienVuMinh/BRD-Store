package com.brdstore.backend.dto.partner;

import com.brdstore.backend.entity.Partner;
import com.brdstore.backend.entity.enums.PartnerStatus;
import com.brdstore.backend.entity.enums.PartnerType;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PartnerResponse(
        UUID id,
        String partnerCode,
        PartnerType partnerType,
        String name,
        String taxId,
        String legalRepName,
        String legalRepPhone,
        String email,
        PartnerStatus status,
        OffsetDateTime createdAt
) {
    public static PartnerResponse from(Partner p) {
        return new PartnerResponse(p.getId(), p.getPartnerCode(), p.getPartnerType(), p.getName(),
                p.getTaxId(), p.getLegalRepName(), p.getLegalRepPhone(), p.getEmail(), p.getStatus(), p.getCreatedAt());
    }
}
