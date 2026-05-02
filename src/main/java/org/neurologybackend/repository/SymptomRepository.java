package org.neurologybackend.repository;

import org.springframework.data.jpa.repository.support.JpaRepositoryFactoryBean;
import org.neurologybackend.model.Symptom;
import org.springframework.data.jpa.repository.support.JpaRepositoryImplementation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SymptomRepository extends JpaRepository<Symptom, Long>, JpaRepositoryImplementation<Symptom, Long> {
    List<Symptom> findByUsernameAndDate(String username, LocalDate date);
}
