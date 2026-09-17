package com.brdstore.backend.service;

import com.brdstore.backend.audit.AuditService;
import com.brdstore.backend.dto.partner.ApiKeyResponse;
import com.brdstore.backend.dto.partner.ApiKeySummaryResponse;
import com.brdstore.backend.dto.partner.PartnerRegisterRequest;
import com.brdstore.backend.dto.partner.PartnerResponse;
import com.brdstore.backend.dto.user.CreatePartnerUserRequest;
import com.brdstore.backend.dto.user.UserResponse;
import com.brdstore.backend.entity.*;
import com.brdstore.backend.entity.enums.AuditAction;
import com.brdstore.backend.entity.enums.NotificationType;
import com.brdstore.backend.entity.enums.PartnerStatus;
import com.brdstore.backend.entity.enums.UserStatus;
import com.brdstore.backend.exception.ApiException;
import com.brdstore.backend.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PartnerService {

    private final PartnerRepository partnerRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final GeographyRepository geographyRepository;
    private final PartnerApiKeyRepository apiKeyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public PartnerService(PartnerRepository partnerRepository, UserRepository userRepository,
                           RoleRepository roleRepository, GeographyRepository geographyRepository,
                           PartnerApiKeyRepository apiKeyRepository, PasswordEncoder passwordEncoder,
                           AuditService auditService, NotificationService notificationService) {
        this.partnerRepository = partnerRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.geographyRepository = geographyRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional
    public PartnerResponse register(PartnerRegisterRequest req) {
        if (partnerRepository.existsByPartnerCode(req.partnerCode())) {
            throw ApiException.conflict("Partner code already exists");
        }
        if (userRepository.existsByUsername(req.adminUsername())) {
            throw ApiException.conflict("Admin username already exists");
        }

        Partner partner = new Partner();
        partner.setPartnerCode(req.partnerCode());
        partner.setPartnerType(req.partnerType());
        partner.setName(req.name());
        partner.setTaxId(req.taxId());
        partner.setLegalRepName(req.legalRepName());
        partner.setLegalRepPhone(req.legalRepPhone());
        partner.setEmail(req.email());
        if (req.provinceCode() != null) partner.setProvince(geographyRepository.findById(req.provinceCode()).orElse(null));
        if (req.districtCode() != null) partner.setDistrict(geographyRepository.findById(req.districtCode()).orElse(null));
        if (req.wardCode() != null) partner.setWard(geographyRepository.findById(req.wardCode()).orElse(null));
        partner.setAddressDetail(req.addressDetail());
        partner.setBankName(req.bankName());
        partner.setBankBranch(req.bankBranch());
        partner.setBankAccountNo(req.bankAccountNo());
        partner.setBankAccountName(req.bankAccountName());
        partner.setStatus(PartnerStatus.PENDING);
        partner = partnerRepository.save(partner);

        auditService.log(AuditAction.CREATE, "partners", partner.getId().toString(), null, PartnerResponse.from(partner));

        User admin = new User();
        admin.setUsername(req.adminUsername());
        admin.setEmail(req.email());
        admin.setPasswordHash(passwordEncoder.encode(req.adminPassword()));
        admin.setFullName(req.adminFullName());
        admin.setPartner(partner);
        admin.setStatus(UserStatus.INACTIVE);
        Role pAdminRole = roleRepository.findByCode("P_ADMIN")
                .orElseThrow(() -> new IllegalStateException("P_ADMIN role missing - check seed data"));
        admin.setRoles(Set.of(pAdminRole));
        userRepository.save(admin);

        auditService.log(AuditAction.CREATE, "users", admin.getId().toString(), null, admin.getUsername());

        return PartnerResponse.from(partner);
    }

    @Transactional
    public PartnerResponse approve(UUID partnerId) {
        Partner partner = getOrThrow(partnerId);
        if (partner.getStatus() != PartnerStatus.PENDING) {
            throw ApiException.badRequest("Only PENDING partners can be approved");
        }
        PartnerStatus old = partner.getStatus();
        partner.setStatus(PartnerStatus.APPROVED);
        partnerRepository.save(partner);

        userRepository.findByPartnerId(partnerId).forEach(u -> {
            u.setStatus(UserStatus.ACTIVE);
            userRepository.save(u);
        });

        auditService.log(AuditAction.STATUS_CHANGE, "partners", partnerId.toString(), old, PartnerStatus.APPROVED);
        userRepository.findByPartnerId(partnerId).stream().findFirst().ifPresent(admin ->
                notificationService.notifyUser(admin, NotificationType.PARTNER_STATUS_CHANGE,
                        "Partner approved", "Your partner application has been approved. You may now sign in."));

        return PartnerResponse.from(partner);
    }

    @Transactional
    public PartnerResponse reject(UUID partnerId, String reason) {
        Partner partner = getOrThrow(partnerId);
        if (partner.getStatus() != PartnerStatus.PENDING) {
            throw ApiException.badRequest("Only PENDING partners can be rejected");
        }
        PartnerStatus old = partner.getStatus();
        partner.setStatus(PartnerStatus.REJECTED);
        partnerRepository.save(partner);

        auditService.log(AuditAction.STATUS_CHANGE, "partners", partnerId.toString(), old, PartnerStatus.REJECTED);
        userRepository.findByPartnerId(partnerId).stream().findFirst().ifPresent(admin ->
                notificationService.notifyUser(admin, NotificationType.PARTNER_STATUS_CHANGE,
                        "Partner rejected", "Your partner application was rejected. Reason: " + reason));

        return PartnerResponse.from(partner);
    }

    @Transactional
    public PartnerResponse suspend(UUID partnerId, String reason) {
        Partner partner = getOrThrow(partnerId);
        if (partner.getStatus() != PartnerStatus.APPROVED) {
            throw ApiException.badRequest("Only APPROVED partners can be suspended");
        }
        PartnerStatus old = partner.getStatus();
        partner.setStatus(PartnerStatus.SUSPENDED);
        partnerRepository.save(partner);

        auditService.log(AuditAction.STATUS_CHANGE, "partners", partnerId.toString(), old, PartnerStatus.SUSPENDED);
        userRepository.findByPartnerId(partnerId).stream().findFirst().ifPresent(admin ->
                notificationService.notifyUser(admin, NotificationType.PARTNER_STATUS_CHANGE,
                        "Partner suspended", "Your partner account has been suspended. Reason: " + reason));

        return PartnerResponse.from(partner);
    }

    public List<PartnerResponse> list(PartnerStatus status) {
        List<Partner> partners = status != null ? partnerRepository.findByStatus(status) : partnerRepository.findAll();
        return partners.stream().map(PartnerResponse::from).toList();
    }

    public PartnerResponse get(UUID id) {
        return PartnerResponse.from(getOrThrow(id));
    }

    @Transactional
    public UserResponse createPartnerUser(UUID partnerId, CreatePartnerUserRequest req) {
        Partner partner = getOrThrow(partnerId);
        if (partner.getStatus() != PartnerStatus.APPROVED) {
            throw ApiException.badRequest("Partner must be APPROVED to create sub-accounts");
        }
        if (userRepository.existsByUsername(req.username())) {
            throw ApiException.conflict("Username already exists");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already exists");
        }
        Set<Role> roles = req.roleCodes().stream()
                .filter(code -> code.startsWith("P_"))
                .map(code -> roleRepository.findByCode(code)
                        .orElseThrow(() -> ApiException.badRequest("Unknown role: " + code)))
                .collect(Collectors.toSet());
        if (roles.isEmpty()) {
            throw ApiException.badRequest("At least one valid partner role (P_*) is required");
        }

        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFullName(req.fullName());
        user.setPartner(partner);
        user.setStatus(UserStatus.ACTIVE);
        user.setRoles(roles);
        user = userRepository.save(user);

        auditService.log(AuditAction.CREATE, "users", user.getId().toString(), null, UserResponse.from(user));
        return UserResponse.from(user);
    }

    public List<UserResponse> listPartnerUsers(UUID partnerId) {
        return userRepository.findByPartnerId(partnerId).stream().map(UserResponse::from).toList();
    }

    @Transactional
    public ApiKeyResponse createApiKey(UUID partnerId, String keyName, UUID createdByUserId) {
        Partner partner = getOrThrow(partnerId);
        String rawKey = generateRawKey();
        PartnerApiKey key = new PartnerApiKey();
        key.setPartner(partner);
        key.setKeyName(keyName);
        key.setApiKeyHash(passwordEncoder.encode(rawKey));
        key.setIsActive(true);
        userRepository.findById(createdByUserId).ifPresent(key::setCreatedBy);
        key = apiKeyRepository.save(key);

        auditService.log(AuditAction.CREATE, "partner_api_keys", key.getId().toString(), null, keyName);
        return new ApiKeyResponse(key.getId(), key.getKeyName(), rawKey, key.getIsActive(), key.getCreatedAt());
    }

    public List<ApiKeySummaryResponse> listApiKeys(UUID partnerId) {
        return apiKeyRepository.findByPartnerId(partnerId).stream().map(ApiKeySummaryResponse::from).toList();
    }

    @Transactional
    public void revokeApiKey(UUID partnerId, UUID keyId) {
        PartnerApiKey key = apiKeyRepository.findById(keyId)
                .filter(k -> k.getPartner().getId().equals(partnerId))
                .orElseThrow(() -> ApiException.notFound("API key not found"));
        key.setIsActive(false);
        apiKeyRepository.save(key);
        auditService.log(AuditAction.UPDATE, "partner_api_keys", keyId.toString(), true, false);
    }

    private String generateRawKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return "brdsk_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private Partner getOrThrow(UUID id) {
        return partnerRepository.findById(id).orElseThrow(() -> ApiException.notFound("Partner not found"));
    }
}
