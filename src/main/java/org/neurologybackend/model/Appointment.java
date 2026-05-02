package org.neurologybackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientUsername;

    private String doctorName;

    private LocalDateTime dateTime;

    private String reason;

    private String status; // PENDING / APPROVED

    // 🔹 GETTERS

    public Long getId() {
        return id;
    }

    public String getPatientUsername() {
        return patientUsername;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public String getReason() {
        return reason;
    }

    public String getStatus() {
        return status;
    }

    // 🔹 SETTERS

    public void setId(Long id) {
        this.id = id;
    }

    public void setPatientUsername(String patientUsername) {
        this.patientUsername = patientUsername;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}