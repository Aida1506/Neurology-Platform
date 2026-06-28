package org.neurologybackend.repository;

import org.neurologybackend.model.AiImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiImageRepository extends JpaRepository<AiImage, Long> {

    List<AiImage> findByPatient_Username(String username);

    List<AiImage> findByPatient_UsernameOrderByCreatedAtDesc(String username);

    List<AiImage> findByPatient_UsernameAndValidationStatus(String username, String validationStatus);

    List<AiImage> findByDoctorIdAndApprovedFalseAndRejectedFalse(
            Long doctorId
    );

    List<AiImage> findByDoctorIdAndValidationStatus(
            Long doctorId,
            String validationStatus
    );

    List<AiImage> findByDoctorId(Long doctorId);
}
