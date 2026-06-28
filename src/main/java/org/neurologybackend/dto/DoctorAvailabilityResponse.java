package org.neurologybackend.dto;

import org.neurologybackend.model.DoctorAvailability;

import java.time.LocalDate;
import java.time.LocalTime;

public record DoctorAvailabilityResponse(
        Long id,
        Long doctorId,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String status
) {
    public static DoctorAvailabilityResponse from(DoctorAvailability availability) {
        if (availability == null) {
            return null;
        }

        return new DoctorAvailabilityResponse(
                availability.getId(),
                availability.getDoctor() == null ? null : availability.getDoctor().getId(),
                availability.getDate(),
                availability.getStartTime(),
                availability.getEndTime(),
                availability.getStatus()
        );
    }
}
