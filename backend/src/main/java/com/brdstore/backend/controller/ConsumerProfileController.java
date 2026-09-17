package com.brdstore.backend.controller;

import com.brdstore.backend.common.CurrentUser;
import com.brdstore.backend.dto.common.MyInstallResponse;
import com.brdstore.backend.service.ConsumerAppService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/consumers/me")
public class ConsumerProfileController {

    private final ConsumerAppService consumerAppService;
    private final CurrentUser currentUser;

    public ConsumerProfileController(ConsumerAppService consumerAppService, CurrentUser currentUser) {
        this.consumerAppService = consumerAppService;
        this.currentUser = currentUser;
    }

    @GetMapping("/installs")
    @PreAuthorize("hasRole('CONSUMER')")
    public List<MyInstallResponse> myInstalls() {
        return consumerAppService.listMyInstalls(currentUser.requireId());
    }
}
