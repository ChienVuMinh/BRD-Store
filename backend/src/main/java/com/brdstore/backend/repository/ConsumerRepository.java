package com.brdstore.backend.repository;

import com.brdstore.backend.entity.Consumer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConsumerRepository extends JpaRepository<Consumer, java.util.UUID> {
    Optional<Consumer> findByEmail(String email);
    Optional<Consumer> findByAccountId(String accountId);
    boolean existsByEmail(String email);
}
