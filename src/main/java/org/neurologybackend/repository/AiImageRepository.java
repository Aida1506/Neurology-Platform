package org.neurologybackend.repository;

import org.neurologybackend.model.AiImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiImageRepository extends JpaRepository<AiImage, Long> {
    List<AiImage> findByPatientUsername(String username);
}