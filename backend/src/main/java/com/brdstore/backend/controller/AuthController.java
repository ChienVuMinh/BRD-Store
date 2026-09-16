package com.brdstore.backend.controller;

import com.brdstore.backend.dto.auth.LoginRequest;
import com.brdstore.backend.dto.auth.LoginResponse;
import com.brdstore.backend.dto.consumer.ConsumerRegisterRequest;
import com.brdstore.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.loginUser(request);
    }

    @PostMapping("/consumer/login")
    public LoginResponse consumerLogin(@Valid @RequestBody LoginRequest request) {
        return authService.loginConsumer(request);
    }

    @PostMapping("/consumer/register")
    public LoginResponse consumerRegister(@Valid @RequestBody ConsumerRegisterRequest request) {
        return authService.registerConsumer(request);
    }
}
