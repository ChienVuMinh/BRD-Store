package com.brdstore.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Email;

import java.util.Set;

public record CreatePartnerUserRequest(
        @NotBlank String username,
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotBlank String fullName,
        @NotEmpty Set<String> roleCodes
) {
}
