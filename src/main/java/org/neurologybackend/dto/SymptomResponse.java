package org.neurologybackend.dto;

import org.neurologybackend.model.Symptom;

import java.time.LocalDate;

public record SymptomResponse(
        Long id,
        String username,
        LocalDate date,
        String symptom,
        Integer severity,
        DoctorResponse assignedDoctor,
        String originalText
) {
    public static SymptomResponse from(Symptom symptom) {
        if (symptom == null) {
            return null;
        }

        return new SymptomResponse(
                symptom.getId(),
                symptom.getUsername(),
                symptom.getDate(),
                symptom.getSymptom(),
                symptom.getSeverity(),
                DoctorResponse.from(symptom.getAssignedDoctor()),
                symptom.getOriginalText()
        );
    }
}
