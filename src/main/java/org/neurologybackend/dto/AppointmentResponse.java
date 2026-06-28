package org.neurologybackend.dto;

import org.neurologybackend.model.Appointment;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        String patientUsername,
        DoctorResponse doctor,
        LocalDateTime dateTime,
        String reason,
        String status,
        DoctorAvailabilityResponse availability
) {
    public static AppointmentResponse from(Appointment appointment) {
        if (appointment == null) {
            return null;
        }

        return new AppointmentResponse(
                appointment.getId(),
                appointment.getPatientUsername(),
                DoctorResponse.from(appointment.getDoctor()),
                appointment.getDateTime(),
                appointment.getReason(),
                appointment.getStatus(),
                DoctorAvailabilityResponse.from(appointment.getAvailability())
        );
    }
}
