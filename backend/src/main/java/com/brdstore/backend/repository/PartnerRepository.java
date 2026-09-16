package com.brdstore.backend.repository;

import com.brdstore.backend.entity.Partner;
import com.brdstore.backend.entity.enums.PartnerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PartnerRepository extends JpaRepository<Partner, UUID>, JpaSpecificationExecutor<Partner> {
    List<Partner> findByStatus(PartnerStatus status);
    Optional<Partner> findByPartnerCode(String partnerCode);
    boolean existsByPartnerCode(String partnerCode);
}
