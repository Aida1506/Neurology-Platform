package org.neurologybackend.dto;

public record DoctorRequest(
        String fullName,
        String specialization,
        String hospital,
        RegisterRequest user
) {
}
