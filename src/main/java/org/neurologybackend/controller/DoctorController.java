package org.neurologybackend.controller;

import org.neurologybackend.dto.AiImageResponse;
import org.neurologybackend.dto.AppointmentResponse;
import org.neurologybackend.dto.DoctorAvailabilityRequest;
import org.neurologybackend.dto.DoctorAvailabilityResponse;
import org.neurologybackend.dto.DoctorRequest;
import org.neurologybackend.dto.DoctorResponse;
import org.neurologybackend.dto.NeurologicalStatusRequest;
import org.neurologybackend.dto.NeurologicalStatusResponse;
import org.neurologybackend.dto.SymptomResponse;
import org.neurologybackend.dto.ValidateImageRequest;
import org.neurologybackend.model.AiImage;
import org.neurologybackend.model.Doctor;
import org.neurologybackend.model.DoctorAvailability;
import org.neurologybackend.repository.AiImageRepository;
import org.neurologybackend.repository.DoctorRepository;
import org.neurologybackend.service.AppointmentService;
import org.neurologybackend.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class DoctorController {

    private final DoctorRepository doctorRepo;

    private final AppointmentService appointmentService;

    private final AiImageRepository aiRepo;

    private final DoctorService doctorService;

    public DoctorController(
            DoctorRepository doctorRepo,
            AppointmentService appointmentService,
            AiImageRepository aiRepo,
            DoctorService doctorService
    ) {

        this.doctorRepo = doctorRepo;
        this.appointmentService = appointmentService;
        this.aiRepo = aiRepo;
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<DoctorResponse> getDoctors() {

        return doctorRepo.findAll()
                .stream()
                .map(DoctorResponse::from)
                .toList();
    }

    @PostMapping
    public DoctorResponse createDoctor(
            @RequestBody DoctorRequest request
    ) {

        return DoctorResponse.from(doctorService.createDoctor(request));
    }

    @PostMapping("/sync-users")
    public List<DoctorResponse> syncDoctorUsers() {

        return doctorService.syncDoctorUsers()
                .stream()
                .map(DoctorResponse::from)
                .toList();
    }

    @GetMapping("/me/{username}")
    public DoctorResponse getCurrentDoctor(
            @PathVariable String username
    ) {

        return DoctorResponse.from(doctorRepo
                .findByUser_Username(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor not found"
                        )
                ));
    }

    @GetMapping("/{doctorId}/appointments")
    public List<AppointmentResponse> getAppointments(
            @PathVariable Long doctorId
    ) {

        return appointmentService
                .getForDoctor(Math.toIntExact(doctorId))
                .stream()
                .map(AppointmentResponse::from)
                .toList();
    }

    @GetMapping("/{doctorId}/patients")
    public List<String> getAssignedPatients(
            @PathVariable Long doctorId
    ) {

        return doctorService.getAssignedPatientUsernames(doctorId);
    }

    @PutMapping("/appointments/{id}/confirm")
    public AppointmentResponse confirmAppointment(
            @PathVariable Long id
    ) {

        return AppointmentResponse.from(appointmentService.confirm(id));
    }

    @PutMapping("/appointments/{id}/reject")
    public AppointmentResponse rejectAppointment(
            @PathVariable Long id
    ) {

        return AppointmentResponse.from(appointmentService.reject(id));
    }

    @GetMapping("/{doctorId}/images/pending")
    public List<AiImageResponse> getPendingImages(
            @PathVariable Long doctorId
    ) {

        return aiRepo
                .findByDoctorIdAndApprovedFalseAndRejectedFalse(
                        doctorId
                )
                .stream()
                .map(AiImageResponse::from)
                .toList();
    }

    @PutMapping("/images/{id}/validate")
    public ResponseEntity<?> validateImage(
            @PathVariable Long id,
            @RequestBody ValidateImageRequest request
    ) {

        AiImage validated = doctorService.validateImage(id, Boolean.TRUE.equals(request.approved()), request.comment());

        return ResponseEntity.ok(AiImageResponse.from(validated));
    }

    @PostMapping("/{doctorId}/availability")
    public ResponseEntity<?> addAvailability(
            @PathVariable Long doctorId,
            @RequestBody DoctorAvailabilityRequest request
    ) {

        DoctorAvailability availability = doctorService.addAvailability(
                doctorId,
                request.date(),
                request.startTime(),
                request.endTime()
        );

        return ResponseEntity.ok(DoctorAvailabilityResponse.from(availability));
    }

    @GetMapping("/{doctorId}/availability")
    public ResponseEntity<?> getAvailability(
            @PathVariable Long doctorId
    ) {

        List<DoctorAvailability> availabilities = doctorService.getDoctorAvailabilities(doctorId);
        return ResponseEntity.ok(availabilities.stream().map(DoctorAvailabilityResponse::from).toList());
    }

    @GetMapping("/{doctorId}/availability/{date}")
    public ResponseEntity<?> getAvailabilityForDate(
            @PathVariable Long doctorId,
            @PathVariable String date
    ) {

        LocalDate localDate = LocalDate.parse(date);
        List<DoctorAvailability> availabilities = doctorService.getAvailabilityForDate(doctorId, localDate);
        return ResponseEntity.ok(availabilities.stream().map(DoctorAvailabilityResponse::from).toList());
    }

    @GetMapping("/{doctorId}/patient/{patientUsername}/symptoms")
    public ResponseEntity<?> getPatientSymptoms(
            @PathVariable Long doctorId,
            @PathVariable String patientUsername
    ) {

        return ResponseEntity.ok(doctorService.getPatientSymptoms(patientUsername).stream().map(SymptomResponse::from).toList());
    }

    @GetMapping("/{doctorId}/neurological-status")
    public ResponseEntity<?> getNeurologicalStatus(
            @PathVariable Long doctorId
    ) {

        String status = doctorService.getNeurologicalStatus(doctorId);
        return ResponseEntity.ok(new NeurologicalStatusResponse(status));
    }

    @PutMapping("/{doctorId}/neurological-status")
    public ResponseEntity<?> updateNeurologicalStatus(
            @PathVariable Long doctorId,
            @RequestBody NeurologicalStatusRequest request
    ) {

        Doctor doctor = doctorService.updateNeurologicalStatus(doctorId, request.status());
        return ResponseEntity.ok(DoctorResponse.from(doctor));
    }

    @PutMapping("/images/{id}/approve")
    public AiImageResponse approveImage(
            @PathVariable Long id
    ) {

        return AiImageResponse.from(doctorService.validateImage(id, true, null));
    }

    @PutMapping("/images/{id}/reject")
    public AiImageResponse rejectImage(
            @PathVariable Long id
    ) {

        return AiImageResponse.from(doctorService.validateImage(id, false, null));
    }
}
