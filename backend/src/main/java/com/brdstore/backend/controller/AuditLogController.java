package com.brdstore.backend.controller;

import com.brdstore.backend.dto.audit.AuditLogResponse;
import com.brdstore.backend.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasAnyRole('S_ADMIN','O_SUPPORT')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public Page<AuditLogResponse> list(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "50") int size) {
        return auditLogRepository.findAll(PageRequest.of(page, size)).map(AuditLogResponse::from);
    }

    @GetMapping("/by-entity")
    public Page<AuditLogResponse> byEntity(@RequestParam String targetEntity,
                                            @RequestParam String targetEntityId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "50") int size) {
        return auditLogRepository.findByTargetEntityAndTargetEntityId(targetEntity, targetEntityId, PageRequest.of(page, size))
                .map(AuditLogResponse::from);
    }
}
