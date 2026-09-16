package com.brdstore.backend.dto.consumer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConsumerRegisterRequest(
        @NotBlank String accountId,
        String fullName,
        @Email String email,
        String phone,
        @NotBlank @Size(min = 6) String password
) {
}
