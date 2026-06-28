package org.neurologybackend.dto;

public record ForgotPasswordRequest(
        String email,
        String usernameOrEmail
) {
}
