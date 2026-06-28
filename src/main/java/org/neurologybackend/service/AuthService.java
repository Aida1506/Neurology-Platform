package org.neurologybackend.service;

import org.neurologybackend.dto.LoginRequest;
import org.neurologybackend.dto.LoginResponse;
import org.neurologybackend.dto.RegisterRequest;
import org.neurologybackend.dto.StatusMessageResponse;
import org.neurologybackend.dto.UserResponse;
import org.neurologybackend.model.User;
import org.neurologybackend.repository.UserRepository;
import org.neurologybackend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public ResponseEntity<?> register(RegisterRequest request) {
        String username = request.username() != null ? request.username().trim() : "";
        String password = request.password() != null ? request.password().trim() : "";
        String email = request.email() != null ? request.email().trim() : "";

        if (username.isBlank() || password.isBlank() || email.isBlank()) {
            return ResponseEntity.badRequest().body(new StatusMessageResponse("error", "Username, email si parola sunt obligatorii."));
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(new StatusMessageResponse("error", "Username deja folosit."));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(new StatusMessageResponse("error", "Email deja folosit."));
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole(request.role());

        if (user.getRole() == null || user.getRole().isEmpty() || "PATIENT".equalsIgnoreCase(user.getRole())) {
            user.setRole("PACIENT");
        }

        userRepository.save(user);

        return ResponseEntity.ok(new StatusMessageResponse("success", "User registered successfully"));
    }

    public ResponseEntity<?> login(LoginRequest request) {
        String username = request.username() != null ? request.username().trim() : "";
        String password = request.password() != null ? request.password().trim() : "";

        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .map(existingUser -> {
                    if (passwordEncoder.matches(password, existingUser.getPassword())) {
                        String token = jwtUtil.generateToken(existingUser.getUsername());
                        return ResponseEntity.ok(LoginResponse.success(token, UserResponse.from(existingUser)));

                    } else if (Objects.equals(existingUser.getPassword(), password)) {
                        existingUser.setPassword(passwordEncoder.encode(password));
                        userRepository.save(existingUser);
                        String token = jwtUtil.generateToken(existingUser.getUsername());
                        return ResponseEntity.ok(LoginResponse.success(token, UserResponse.from(existingUser)));

                    } else {
                        return ResponseEntity.status(401).body(LoginResponse.failure("Invalid password"));
                    }
                })
                .orElse(ResponseEntity.status(404).body(LoginResponse.failure("User sau email negasit")));
    }

    public UserResponse currentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        return UserResponse.from(user);
    }
}
