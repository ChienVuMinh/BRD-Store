package com.brdstore.backend.controller;

import com.brdstore.backend.dto.user.CreateSystemUserRequest;
import com.brdstore.backend.dto.user.UserResponse;
import com.brdstore.backend.entity.enums.UserStatus;
import com.brdstore.backend.service.UserAdminService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/system/users")
@PreAuthorize("hasRole('S_ADMIN')")
public class UserAdminController {

    private final UserAdminService userAdminService;

    public UserAdminController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @PostMapping
    public UserResponse create(@Valid @RequestBody CreateSystemUserRequest request) {
        return userAdminService.createSystemOrOwnerUser(request);
    }

    @GetMapping
    public List<UserResponse> list() {
        return userAdminService.listAll();
    }

    @PostMapping("/{id}/status")
    public UserResponse setStatus(@PathVariable UUID id, @RequestParam UserStatus status) {
        return userAdminService.setStatus(id, status);
    }
}
