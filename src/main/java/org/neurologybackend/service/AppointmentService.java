package org.neurologybackend.service;

import org.neurologybackend.dto.CreateAppointmentRequest;
import org.neurologybackend.model.Appointment;
import org.neurologybackend.model.Doctor;
import org.neurologybackend.model.DoctorAvailability;
import org.neurologybackend.repository.AppointmentRepository;
import org.neurologybackend.repository.DoctorAvailabilityRepository;
import org.neurologybackend.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository repo;
    private final DoctorRepository doctorRepo;
    private final DoctorAvailabilityRepository availabilityRepo;

    public AppointmentService(
            AppointmentRepository repo,
            DoctorRepository doctorRepo,
            DoctorAvailabilityRepository availabilityRepo
    ) {
        this.repo = repo;
        this.doctorRepo = doctorRepo;
        this.availabilityRepo = availabilityRepo;
    }

    public Appointment create(CreateAppointmentRequest req) {

        Doctor doctor = doctorRepo.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (req.getAvailabilityId() == null) {
            throw new RuntimeException("Please select an available time slot");
        }

        DoctorAvailability availability = availabilityRepo.findById(req.getAvailabilityId())
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        if (!availability.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("Availability does not belong to selected doctor");
        }

        if (!"AVAILABLE".equals(availability.getStatus())
                || repo.existsByAvailabilityIdAndStatusNot(availability.getId(), "REJECTED")) {
            throw new RuntimeException("Selected time slot is not available");
        }

        Appointment a = new Appointment();

        a.setPatientUsername(req.getPatientUsername());
        a.setDoctor(doctor);
        a.setAvailability(availability);
        a.setDateTime(availability.getDate().atTime(availability.getStartTime()));
        a.setReason(req.getReason());
        a.setStatus("PENDING");

        availability.setStatus("BOOKED");
        availabilityRepo.save(availability);

        return repo.save(a);
    }

    public List<Appointment> getForUser(String username) {
        return repo.findByPatientUsername(username);
    }

    public List<Appointment> getForDoctor(Integer doctorId) {

        return repo.findByDoctorId((long) doctorId);
    }

    public Appointment confirm(Long id) {

        Appointment a = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        a.setStatus("CONFIRMED");

        return repo.save(a);
    }

    public Appointment reject(Long id) {

        Appointment a = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        a.setStatus("REJECTED");

        if (a.getAvailability() != null) {
            a.getAvailability().setStatus("AVAILABLE");
            availabilityRepo.save(a.getAvailability());
        }

        return repo.save(a);
    }
}
