package org.neurologybackend.controller;

import org.neurologybackend.model.AiImage;
import org.neurologybackend.model.Appointment;
import org.neurologybackend.model.Symptom;
import org.neurologybackend.service.AiService;
import org.neurologybackend.service.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.neurologybackend.repository.AiImageRepository;
import org.neurologybackend.service.AppointmentService;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AiService aiService;
    private final AiImageRepository aiImageRepository;
    private final AppointmentService appointmentService;

    public DashboardController(DashboardService dashboardService, AiService aiService, AiImageRepository aiImageRepository, AppointmentService appointmentService) {
        this.dashboardService = dashboardService;
        this.aiService = aiService;
        this.aiImageRepository = aiImageRepository;
        this.appointmentService = appointmentService;
    }


    @PostMapping("/symptoms/add")
    public ResponseEntity<?> addSymptom(@RequestBody Symptom symptom) {
        return ResponseEntity.ok(dashboardService.addSymptom(symptom));
    }

    @GetMapping("/symptoms/{username}")
    public ResponseEntity<?> getSymptoms(@PathVariable String username) {
        return ResponseEntity.ok(dashboardService.getTodaySymptoms(username));
    }

    @PostMapping("/chat/{username}")
    public ResponseEntity<?> chat(@PathVariable String username, @RequestBody Map<String,String> body) {
        String reply = dashboardService.chat(username, body.get("message"));
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    @PostMapping("/ai/predict")
    public ResponseEntity<?> predict(@RequestParam("file") MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String result = aiService.predict(bytes);

            // 🔥 SALVEZI AICI
            aiService.saveResult(file.getOriginalFilename(), result, bytes);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/ai/gradcam")
    public ResponseEntity<?> gradcam(@RequestParam("file") MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            byte[] image = aiService.gradcam(bytes);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(image);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/ai/image/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {

        AiImage img = aiImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(img.getImageData());
    }

    @GetMapping("/ai/history")
    public ResponseEntity<?> getHistory() {
        return ResponseEntity.ok(aiImageRepository.findAll());
    }

    @PostMapping("/appointments")
    public Appointment create(@RequestBody Appointment a) {
        return appointmentService.create(a);
    }

    @GetMapping("/appointments/{username}")
    public List<Appointment> get(@PathVariable String username) {
        return appointmentService.getForUser(username);
    }
}

