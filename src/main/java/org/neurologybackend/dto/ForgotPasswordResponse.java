package org.neurologybackend.dto;

public record ForgotPasswordResponse(
        String message,
        boolean emailSent
) {
}
