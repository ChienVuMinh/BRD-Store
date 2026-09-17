package com.brdstore.backend.dto.app;

import java.util.List;

public record AppClassificationResponse(
        List<Integer> categoryIds,
        List<String> geographyCodes,
        List<String> tagNames,
        List<AppPermissionMapResponse> permissions
) {
}
