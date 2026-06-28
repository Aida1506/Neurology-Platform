package org.neurologybackend.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {
}
