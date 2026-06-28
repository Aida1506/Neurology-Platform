package org.neurologybackend.dto;

public record ResetPasswordRequest(
        String token,
        String newPassword
) {
}
