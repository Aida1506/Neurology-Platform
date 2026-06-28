package org.neurologybackend.dto;

public record SymptomRequest(
        String username,
        String symptom,
        Integer severity,
        Long assignedDoctorId,
        String originalText
) {
}
