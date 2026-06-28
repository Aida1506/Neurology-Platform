package org.neurologybackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientUsername;

    @ManyToOne
    private Doctor doctor;

    private LocalDateTime dateTime;

    private String reason;

    private String status;

    @ManyToOne
    @JoinColumn(name = "availability_id")
    private DoctorAvailability availability;


    public Long getId() {
        return id;
    }

    public String getPatientUsername() {
        return patientUsername;
    }

    public Doctor getDoctor() {
        return doctor;
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

    public DoctorAvailability getAvailability() {
        return availability;
    }


    public void setId(Long id) {
        this.id = id;
    }

    public void setPatientUsername(String patientUsername) {
        this.patientUsername = patientUsername;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
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

    public void setAvailability(DoctorAvailability availability) {
        this.availability = availability;
    }
}
