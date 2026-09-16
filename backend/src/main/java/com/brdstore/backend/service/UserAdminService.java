package com.brdstore.backend.service;

import com.brdstore.backend.audit.AuditService;
import com.brdstore.backend.dto.user.CreateSystemUserRequest;
import com.brdstore.backend.dto.user.UserResponse;
import com.brdstore.backend.entity.Role;
import com.brdstore.backend.entity.User;
import com.brdstore.backend.entity.enums.AuditAction;
import com.brdstore.backend.entity.enums.UserStatus;
import com.brdstore.backend.exception.ApiException;
import com.brdstore.backend.repository.RoleRepository;
import com.brdstore.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserAdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserAdminService(UserRepository userRepository, RoleRepository roleRepository,
                             PasswordEncoder passwordEncoder, AuditService auditService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional
    public UserResponse createSystemOrOwnerUser(CreateSystemUserRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw ApiException.conflict("Username already exists");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already exists");
        }
        Set<Role> roles = req.roleCodes().stream()
                .filter(code -> code.startsWith("S_") || code.startsWith("O_"))
                .map(code -> roleRepository.findByCode(code)
                        .orElseThrow(() -> ApiException.badRequest("Unknown role: " + code)))
                .collect(Collectors.toSet());
        if (roles.isEmpty()) {
            throw ApiException.badRequest("At least one valid system/owner role (S_*/O_*) is required");
        }

        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFullName(req.fullName());
        user.setStatus(UserStatus.ACTIVE);
        user.setRoles(roles);
        user = userRepository.save(user);

        auditService.log(AuditAction.CREATE, "users", user.getId().toString(), null, UserResponse.from(user));
        auditService.log(AuditAction.ROLE_CHANGE, "user_roles", user.getId().toString(), null, req.roleCodes());
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse setStatus(UUID userId, UserStatus status) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        UserStatus old = user.getStatus();
        user.setStatus(status);
        userRepository.save(user);
        auditService.log(AuditAction.STATUS_CHANGE, "users", userId.toString(), old, status);
        return UserResponse.from(user);
    }

    public List<UserResponse> listAll() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }
}
