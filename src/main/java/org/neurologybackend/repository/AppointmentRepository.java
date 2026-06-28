package org.neurologybackend.repository;

import org.neurologybackend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientUsername(String username);

    List<Appointment> findByDoctorId(Long doctorId);

    boolean existsByAvailabilityIdAndStatusNot(Long availabilityId, String status);
}
