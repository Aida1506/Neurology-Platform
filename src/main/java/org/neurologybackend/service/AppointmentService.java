package org.neurologybackend.service;

import org.neurologybackend.model.Appointment;
import org.neurologybackend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository repo;

    public AppointmentService(AppointmentRepository repo) {
        this.repo = repo;
    }

    public Appointment create(Appointment a) {
        a.setStatus("PENDING");
        return repo.save(a);
    }

    public List<Appointment> getForUser(String username) {
        return repo.findByPatientUsername(username);
    }
}
