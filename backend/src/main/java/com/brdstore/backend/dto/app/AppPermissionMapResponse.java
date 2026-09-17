package com.brdstore.backend.dto.app;

import com.brdstore.backend.entity.AppPermissionMap;

public record AppPermissionMapResponse(
        Integer permissionId,
        String permissionCode,
        String permissionName,
        boolean isSensitive,
        String justification
) {
    public static AppPermissionMapResponse from(AppPermissionMap map) {
        return new AppPermissionMapResponse(
                map.getPermission().getId(),
                map.getPermission().getCode(),
                map.getPermission().getName(),
                Boolean.TRUE.equals(map.getPermission().getIsSensitive()),
                map.getJustification()
        );
    }
}
