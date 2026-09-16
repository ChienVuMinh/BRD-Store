package com.brdstore.backend.service;

import com.brdstore.backend.dto.notification.NotificationResponse;
import com.brdstore.backend.entity.Consumer;
import com.brdstore.backend.entity.Notification;
import com.brdstore.backend.entity.User;
import com.brdstore.backend.entity.enums.NotificationType;
import com.brdstore.backend.exception.ApiException;
import com.brdstore.backend.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Page<NotificationResponse> listForUser(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(NotificationResponse::from);
    }

    public Page<NotificationResponse> listForConsumer(UUID consumerId, Pageable pageable) {
        return notificationRepository.findByConsumerIdOrderByCreatedAtDesc(consumerId, pageable).map(NotificationResponse::from);
    }

    @Transactional
    public void markRead(UUID notificationId, UUID principalId, boolean isConsumer) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        boolean owns = isConsumer
                ? n.getConsumer() != null && n.getConsumer().getId().equals(principalId)
                : n.getUser() != null && n.getUser().getId().equals(principalId);
        if (!owns) {
            throw ApiException.forbidden("Not your notification");
        }
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Async
    public void notifyUser(User user, NotificationType type, String title, String message) {
        if (user == null) return;
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        notificationRepository.save(n);
    }

    @Async
    public void notifyConsumer(Consumer consumer, NotificationType type, String title, String message) {
        if (consumer == null) return;
        Notification n = new Notification();
        n.setConsumer(consumer);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        notificationRepository.save(n);
    }
}
