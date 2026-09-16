package com.brdstore.backend.dto.partner;

import com.brdstore.backend.entity.enums.PartnerType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PartnerRegisterRequest(
        @NotBlank String partnerCode,
        @NotNull PartnerType partnerType,
        @NotBlank String name,
        String taxId,
        @NotBlank String legalRepName,
        String legalRepPhone,
        @NotBlank @Email String email,
        String provinceCode,
        String districtCode,
        String wardCode,
        String addressDetail,
        String bankName,
        String bankBranch,
        String bankAccountNo,
        String bankAccountName,
        @NotBlank String adminUsername,
        @NotBlank String adminPassword,
        @NotBlank String adminFullName
) {
}
