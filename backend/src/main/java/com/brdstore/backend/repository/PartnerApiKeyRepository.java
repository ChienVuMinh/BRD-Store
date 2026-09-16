package com.brdstore.backend.repository;

import com.brdstore.backend.entity.PartnerApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PartnerApiKeyRepository extends JpaRepository<PartnerApiKey, UUID> {
    List<PartnerApiKey> findByPartnerId(UUID partnerId);
}
