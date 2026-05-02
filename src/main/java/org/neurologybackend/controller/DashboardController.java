package org.neurologybackend.controller;

import org.neurologybackend.model.Symptom;
import org.neurologybackend.service.AiService;
import org.neurologybackend.service.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AiService aiService;

    public DashboardController(DashboardService dashboardService, AiService aiService) {
        this.dashboardService = dashboardService;
        this.aiService = aiService;
    }

    @GetMapping("/analysis/{username}")
    public ResponseEntity<?> getAnalysis(@PathVariable String username) {
        return ResponseEntity.ok(dashboardService.getAnalyses(username));
    }

    @PostMapping("/symptoms/add")
    public ResponseEntity<?> addSymptom(@RequestBody Symptom symptom) {
        return ResponseEntity.ok(dashboardService.addSymptom(symptom));
    }

    @GetMapping("/symptoms/{username}")
    public ResponseEntity<?> getSymptoms(@PathVariable String username) {
        return ResponseEntity.ok(dashboardService.getTodaySymptoms(username));
    }

    @GetMapping("/devices/{username}")
    public ResponseEntity<?> getDevices(@PathVariable String username) {
        return ResponseEntity.ok(dashboardService.getDeviceData(username));
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

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
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
}

