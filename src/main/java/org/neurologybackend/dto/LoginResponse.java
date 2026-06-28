package org.neurologybackend.dto;

public record LoginResponse(
        boolean success,
        String token,
        UserResponse user,
        String message
) {
    public static LoginResponse success(String token, UserResponse user) {
        return new LoginResponse(true, token, user, null);
    }

    public static LoginResponse failure(String message) {
        return new LoginResponse(false, null, null, message);
    }
}
