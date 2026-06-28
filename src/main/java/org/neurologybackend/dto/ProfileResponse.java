package org.neurologybackend.dto;

import org.neurologybackend.model.User;

public record ProfileResponse(
        String username,
        String email,
        String role
) {
    public static ProfileResponse from(User user) {
        return new ProfileResponse(
                user.getUsername(),
                user.getEmail() == null ? "" : user.getEmail(),
                user.getRole()
        );
    }
}
