package org.neurologybackend.dto;

import org.neurologybackend.model.User;

public record UserResponse(
        Integer id,
        String username,
        String email,
        String role
) {
    public static UserResponse from(User user) {
        if (user == null) {
            return null;
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail() == null ? "" : user.getEmail(),
                user.getRole()
        );
    }
}
