package com.brdstore.backend.repository;

import com.brdstore.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<Notification> findByConsumerIdOrderByCreatedAtDesc(UUID consumerId, Pageable pageable);
    long countByUserIdAndIsReadFalse(UUID userId);
    long countByConsumerIdAndIsReadFalse(UUID consumerId);
}
