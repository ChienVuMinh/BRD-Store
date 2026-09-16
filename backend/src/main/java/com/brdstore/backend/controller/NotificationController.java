package com.brdstore.backend.controller;

import com.brdstore.backend.common.CurrentUser;
import com.brdstore.backend.dto.notification.NotificationResponse;
import com.brdstore.backend.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUser currentUser;

    public NotificationController(NotificationService notificationService, CurrentUser currentUser) {
        this.notificationService = notificationService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public Page<NotificationResponse> list(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        UUID id = currentUser.requireId();
        return currentUser.isConsumer()
                ? notificationService.listForConsumer(id, PageRequest.of(page, size))
                : notificationService.listForUser(id, PageRequest.of(page, size));
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable UUID id) {
        notificationService.markRead(id, currentUser.requireId(), currentUser.isConsumer());
    }
}
