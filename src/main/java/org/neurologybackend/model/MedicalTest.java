package org.neurologybackend.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "medical_tests")
public class MedicalTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String testType;
    private String analysisResult;
    private LocalDate dateUploaded;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }
    public String getAnalysisResult() { return analysisResult; }
    public void setAnalysisResult(String analysisResult) { this.analysisResult = analysisResult; }
    public LocalDate getDateUploaded() { return dateUploaded; }
    public void setDateUploaded(LocalDate dateUploaded) { this.dateUploaded = dateUploaded; }

}
