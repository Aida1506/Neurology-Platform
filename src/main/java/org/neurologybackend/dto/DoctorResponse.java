package org.neurologybackend.dto;

import org.neurologybackend.model.Doctor;

public record DoctorResponse(
        Long id,
        String fullName,
        String specialization,
        String hospital,
        UserResponse user,
        String neurologicalStatus
) {
    public static DoctorResponse from(Doctor doctor) {
        if (doctor == null) {
            return null;
        }

        return new DoctorResponse(
                doctor.getId(),
                doctor.getFullName(),
                doctor.getSpecialization(),
                doctor.getHospital(),
                UserResponse.from(doctor.getUser()),
                doctor.getNeurologicalStatus()
        );
    }
}
