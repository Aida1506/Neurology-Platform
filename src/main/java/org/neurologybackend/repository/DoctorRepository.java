package org.neurologybackend.repository;

import org.neurologybackend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository
        extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUser_Username(
            String username
    );
}