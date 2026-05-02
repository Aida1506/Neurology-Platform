package org.neurologybackend.repository;

import org.neurologybackend.model.MedicalTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalTestRepository extends JpaRepository<MedicalTest, Long> {

    List<MedicalTest> findByUsernameOrderByDateUploadedDesc(String username);
}
