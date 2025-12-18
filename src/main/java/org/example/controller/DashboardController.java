package org.example.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final JdbcTemplate jdbcTemplate;

    public DashboardController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 1. Endpoint pentru analize AI
    @GetMapping("/analysis/{username}")
    public ResponseEntity<?> getAnalysis(@PathVariable String username) {
        List<Map<String, Object>> analyses = jdbcTemplate.queryForList(
                "SELECT test_type, analysis_result, date_uploaded FROM medical_tests WHERE username = ? ORDER BY date_uploaded DESC",
                username
        );
        return ResponseEntity.ok(analyses);
    }

    // 2. Endpoint pentru simptome
    @PostMapping("/symptoms/add")
    public ResponseEntity<?> addSymptom(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String symptom = (String) payload.get("symptom");
        Integer severity = (Integer) payload.get("severity");

        try {
            jdbcTemplate.update(
                    "INSERT INTO symptoms (username, date, symptom, severity) VALUES (?, CURRENT_DATE, ?, ?)",
                    username, symptom, severity
            );
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Symptom added successfully"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    // GET simptome
    @GetMapping("/symptoms/{username}")
    public ResponseEntity<?> getSymptoms(@PathVariable String username) {
        List<Map<String, Object>> symptoms = jdbcTemplate.queryForList(
                "SELECT id, date, symptom, severity " +
                        "FROM symptoms " +
                        "WHERE username = ? " +
                        "ORDER BY date DESC, id DESC",
                username
        );
        return ResponseEntity.ok(symptoms);
    }



    // 3. Endpoint pentru date dispozitive
    @GetMapping("/devices/{username}")
    public ResponseEntity<?> getDeviceData(@PathVariable String username) {
        List<Map<String, Object>> data = jdbcTemplate.queryForList(
                "SELECT device_type, value, timestamp FROM device_data WHERE username = ? ORDER BY timestamp DESC",
                username
        );
        return ResponseEntity.ok(data);
    }

    // 4. Endpoint chatbot AI
    @PostMapping("/chat/{username}")
    public ResponseEntity<?> chat(@PathVariable String username, @RequestBody Map<String, String> body) {
        String userMessage = body.get("message");
        String botReply = "Acesta este un răspuns AI pentru: " + userMessage;

        jdbcTemplate.update(
                "INSERT INTO chat_messages(username, role, message, timestamp) VALUES(?, 'user', ?, NOW())",
                username, userMessage
        );
        jdbcTemplate.update(
                "INSERT INTO chat_messages(username, role, message, timestamp) VALUES(?, 'bot', ?, NOW())",
                username, botReply
        );

        return ResponseEntity.ok(Map.of("reply", botReply));
    }
}
