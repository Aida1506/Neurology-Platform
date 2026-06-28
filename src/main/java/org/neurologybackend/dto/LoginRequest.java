package org.neurologybackend.dto;

public record LoginRequest(
        String username,
        String password
) {
}
