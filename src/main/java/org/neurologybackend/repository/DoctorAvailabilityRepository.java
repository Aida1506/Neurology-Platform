package org.neurologybackend.repository;

import org.neurologybackend.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorIdAndDate(Long doctorId, LocalDate date);

    List<DoctorAvailability> findByDoctorIdAndDateAndStatus(Long doctorId, LocalDate date, String status);

    List<DoctorAvailability> findByDoctorIdAndStatusAndDateGreaterThanEqual(
            Long doctorId, 
            String status, 
            LocalDate date
    );

    List<DoctorAvailability> findByDoctorId(Long doctorId);
}
