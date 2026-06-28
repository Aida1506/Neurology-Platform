package org.neurologybackend.dto;

import org.neurologybackend.model.AiImage;

import java.time.LocalDateTime;

public record AiImageResponse(
        Long id,
        String filename,
        String patientUsername,
        DoctorResponse doctor,
        String resultJson,
        boolean approved,
        boolean rejected,
        String doctorComment,
        Double confidence,
        String disease,
        LocalDateTime createdAt,
        LocalDateTime approvedAt,
        String validationStatus
) {
    public static AiImageResponse from(AiImage image) {
        return from(image, true);
    }

    public static AiImageResponse patientView(AiImage image) {
        return from(image, image != null && image.isApproved());
    }

    private static AiImageResponse from(AiImage image, boolean includeResult) {
        if (image == null) {
            return null;
        }

        return new AiImageResponse(
                image.getId(),
                image.getFilename(),
                image.getPatientUsername(),
                DoctorResponse.from(image.getDoctor()),
                includeResult ? image.getResultJson() : null,
                image.isApproved(),
                image.isRejected(),
                image.getDoctorComment(),
                includeResult ? image.getConfidence() : null,
                includeResult ? image.getDisease() : null,
                image.getCreatedAt(),
                image.getApprovedAt(),
                image.getValidationStatus()
        );
    }
}
