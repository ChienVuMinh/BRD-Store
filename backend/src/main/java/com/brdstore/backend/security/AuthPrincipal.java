package com.brdstore.backend.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.List;
import java.util.UUID;

@Getter
public class AuthPrincipal extends User {

    private final UUID id;
    private final String principalType;
    private final UUID partnerId;

    public AuthPrincipal(UUID id, String username, String principalType, UUID partnerId, List<String> roles) {
        super(username, "", mapAuthorities(roles));
        this.id = id;
        this.principalType = principalType;
        this.partnerId = partnerId;
    }

    private static List<GrantedAuthority> mapAuthorities(List<String> roles) {
        return roles.stream()
                .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r))
                .toList();
    }
}
