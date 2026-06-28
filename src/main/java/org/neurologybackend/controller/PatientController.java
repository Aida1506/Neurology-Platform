package org.neurologybackend.controller;

import org.neurologybackend.dto.AiImageResponse;
import org.neurologybackend.dto.AppointmentResponse;
import org.neurologybackend.dto.ChatRequest;
import org.neurologybackend.dto.ChatResponse;
import org.neurologybackend.dto.CreateAppointmentRequest;
import org.neurologybackend.dto.MessageResponse;
import org.neurologybackend.dto.NaturalSymptomRequest;
import org.neurologybackend.dto.SymptomRequest;
import org.neurologybackend.dto.SymptomResponse;
import org.neurologybackend.model.AiImage;
import org.neurologybackend.model.Doctor;
import org.neurologybackend.repository.AiImageRepository;
import org.neurologybackend.repository.DoctorRepository;
import org.neurologybackend.service.AiService;
import org.neurologybackend.service.AppointmentService;
import org.neurologybackend.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/patient")
public class PatientController {

    private final PatientService pacientService;

    private final AiService aiService;

    private final AiImageRepository aiImageRepository;

    private final AppointmentService appointmentService;

    private final DoctorRepository doctorRepository;

    public PatientController(
            PatientService patientService,
            AiService aiService,
            AiImageRepository aiImageRepository,
            AppointmentService appointmentService,
            DoctorRepository doctorRepository
    ) {

        this.pacientService = patientService;
        this.aiService = aiService;
        this.aiImageRepository = aiImageRepository;
        this.appointmentService = appointmentService;
        this.doctorRepository = doctorRepository;
    }

    @PostMapping("/symptoms/add")
    public ResponseEntity<?> addSymptom(
            @RequestBody SymptomRequest request
    ) {

        return ResponseEntity.ok(
                SymptomResponse.from(pacientService.addSymptom(request))
        );
    }

    @PostMapping("/symptoms/add-natural/{username}")
    public ResponseEntity<?> addSymptomFromNaturalLanguage(
            @PathVariable String username,
            @RequestBody NaturalSymptomRequest request
    ) {

        return ResponseEntity.ok(SymptomResponse.from(pacientService.addSymptomFromNaturalLanguage(
                username,
                request.text(),
                request.doctorId()
        )));
    }

    @GetMapping("/symptoms/{username}")
    public ResponseEntity<?> getSymptoms(
            @PathVariable String username
    ) {

        return ResponseEntity.ok(
                pacientService.getTodaySymptoms(username)
                        .stream()
                        .map(SymptomResponse::from)
                        .toList()
        );
    }

    @PostMapping("/chat/{username}")
    public ResponseEntity<?> chat(
            @PathVariable String username,
            @RequestBody ChatRequest request
    ) {

        String reply =
                pacientService.chat(
                        username,
                        request.message()
                );

        return ResponseEntity.ok(new ChatResponse(reply));
    }

    @PostMapping("/ai/predict/{username}")
    public ResponseEntity<?> predict(
            @PathVariable String username,
            @RequestParam("file") MultipartFile file,
            @RequestParam Long doctorId
    ) {

        try {

            byte[] bytes = file.getBytes();

            String result =
                    aiService.predict(bytes);

            Doctor doctor =
                    doctorRepository
                            .findById(doctorId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Doctor not found"
                                    )
                            );

            AiImage image =
                    aiService.saveResult(
                            username,
                            file.getOriginalFilename(),
                            result,
                            bytes
                    );

            image.setDoctor(doctor);

            image.setApproved(false);

            image.setRejected(false);

            image.setValidationStatus("PENDING");

            aiImageRepository.save(image);

            return ResponseEntity.ok(new MessageResponse("Image uploaded successfully. Awaiting doctor validation."));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(e.getMessage()));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/ai/image/{id}")
    public ResponseEntity<byte[]> getImage(
            @PathVariable Long id
    ) {

        AiImage img =
                aiImageRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Image not found"
                                )
                        );

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(img.getImageData());
    }

    @GetMapping("/ai/history/{username}")
    public ResponseEntity<?> getHistory(
            @PathVariable String username
    ) {

        return ResponseEntity.ok(
                aiImageRepository
                        .findByPatient_UsernameOrderByCreatedAtDesc(username)
                        .stream()
                        .map(AiImageResponse::patientView)
                        .toList()
        );
    }

    @PostMapping("/appointments")
    public AppointmentResponse create(
            @RequestBody CreateAppointmentRequest request
    ) {

        return AppointmentResponse.from(appointmentService.create(request));
    }

    @GetMapping("/appointments/{username}")
    public List<AppointmentResponse> get(
            @PathVariable String username
    ) {

        return appointmentService.getForUser(username)
                .stream()
                .map(AppointmentResponse::from)
                .toList();
    }
}
