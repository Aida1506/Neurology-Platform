package org.neurologybackend.service;

import org.neurologybackend.model.User;
import org.neurologybackend.repository.UserRepository;
import org.neurologybackend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public ResponseEntity<?> register(User user) {

        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("PACIENT");
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "User registered successfully"
        ));
    }

    public ResponseEntity<?> login(User user) {

        return userRepository.findByUsername(user.getUsername())
                .map(existingUser -> {
                    if (existingUser.getPassword().equals(user.getPassword())) {
                        String token = jwtUtil.generateToken(user.getUsername());
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "token", token,
                                "user", Map.of(
                                        "username", existingUser.getUsername(),
                                        "role", existingUser.getRole()
                                )
                        ));

                    } else {
                        return ResponseEntity.status(401).body(Map.of(
                                "success", false,
                                "message", "Invalid password"
                        ));
                    }
                })
                .orElse(ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "User not found"
                )));
    }

}

