package org.example.controller;

import org.example.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000") // permite request-uri din React
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JdbcTemplate jdbcTemplate;

    public AuthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        System.out.println("📩 Received user: " + user.getUsername() + " / " + user.getPassword() + " / " + user.getRole());

        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("PACIENT"); // default role
        }

        try {
            jdbcTemplate.update("CALL register_user(?, ?, ?)",
                    user.getUsername(),
                    user.getPassword(),
                    user.getRole());

            // return JSON cu status 200 OK
            return ResponseEntity.ok("{\"status\":\"success\",\"message\":\"User registered successfully\"}");

        } catch (Exception e) {
            e.printStackTrace();
            // return JSON cu status 400 Bad Request și mesaj de eroare
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("{\"status\":\"error\",\"message\":\"Registration failed: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            Integer result = jdbcTemplate.queryForObject(
                    "CALL login_user(?, ?)",
                    Integer.class,
                    user.getUsername(),
                    user.getPassword()
            );

            if (result != null && result > 0) {
                return ResponseEntity.ok("{\"status\":\"success\",\"message\":\"Login successful\"}");
            } else {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("{\"status\":\"error\",\"message\":\"Invalid credentials\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("{\"status\":\"error\",\"message\":\"Login failed: " + e.getMessage() + "\"}");
        }
    }
}
