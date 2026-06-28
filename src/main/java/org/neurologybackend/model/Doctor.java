package org.neurologybackend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    private String specialization;

    private String hospital;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @JsonIgnore
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Appointment> appointments;

    @JsonIgnore
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<AiImage> assignedImages;

    @JsonIgnore
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<DoctorAvailability> availabilities;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String neurologicalStatus;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getHospital() {
        return hospital;
    }

    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public List<AiImage> getAssignedImages() {
        return assignedImages;
    }

    public void setAssignedImages(List<AiImage> assignedImages) {
        this.assignedImages = assignedImages;
    }

    public List<DoctorAvailability> getAvailabilities() {
        return availabilities;
    }

    public void setAvailabilities(List<DoctorAvailability> availabilities) {
        this.availabilities = availabilities;
    }

    public String getNeurologicalStatus() {
        return neurologicalStatus;
    }

    public void setNeurologicalStatus(String neurologicalStatus) {
        this.neurologicalStatus = neurologicalStatus;
    }
}
