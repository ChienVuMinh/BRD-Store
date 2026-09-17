package com.brdstore.backend.service;

import com.brdstore.backend.dto.auth.LoginRequest;
import com.brdstore.backend.dto.auth.LoginResponse;
import com.brdstore.backend.dto.consumer.ConsumerRegisterRequest;
import com.brdstore.backend.entity.Consumer;
import com.brdstore.backend.entity.Role;
import com.brdstore.backend.entity.User;
import com.brdstore.backend.entity.enums.UserStatus;
import com.brdstore.backend.exception.ApiException;
import com.brdstore.backend.repository.ConsumerRepository;
import com.brdstore.backend.repository.UserRepository;
import com.brdstore.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ConsumerRepository consumerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, ConsumerRepository consumerRepository,
                        PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.consumerRepository = consumerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse loginUser(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Account is not active");
        }

        List<String> roles = user.getRoles().stream().map(Role::getCode).toList();
        String partnerId = user.getPartner() != null ? user.getPartner().getId().toString() : null;
        String token = jwtService.generateToken(user.getId().toString(), "USER", roles, partnerId);

        return new LoginResponse(token, "USER", user.getId().toString(), user.getUsername(), roles, partnerId);
    }

    public LoginResponse loginConsumer(LoginRequest request) {
        Consumer consumer = consumerRepository.findByAccountId(request.username())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (consumer.getPasswordHash() == null || !passwordEncoder.matches(request.password(), consumer.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generateToken(consumer.getId().toString(), "CONSUMER", List.of("CONSUMER"), null);
        return new LoginResponse(token, "CONSUMER", consumer.getId().toString(), consumer.getAccountId(), List.of("CONSUMER"), null);
    }

    @Transactional
    public LoginResponse registerConsumer(ConsumerRegisterRequest request) {
        if (consumerRepository.findByAccountId(request.accountId()).isPresent()) {
            throw ApiException.conflict("Account ID already in use");
        }
        if (request.email() != null && consumerRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("Email already in use");
        }
        Consumer consumer = new Consumer();
        consumer.setAccountId(request.accountId());
        consumer.setFullName(request.fullName());
        consumer.setEmail(request.email());
        consumer.setPhone(request.phone());
        consumer.setPasswordHash(passwordEncoder.encode(request.password()));
        consumer = consumerRepository.save(consumer);

        String token = jwtService.generateToken(consumer.getId().toString(), "CONSUMER", List.of("CONSUMER"), null);
        return new LoginResponse(token, "CONSUMER", consumer.getId().toString(), consumer.getAccountId(), List.of("CONSUMER"), null);
    }
}
