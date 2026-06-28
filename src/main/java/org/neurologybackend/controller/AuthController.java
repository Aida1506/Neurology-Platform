package org.neurologybackend.controller;

import org.neurologybackend.dto.LoginRequest;
import org.neurologybackend.dto.RegisterRequest;
import org.neurologybackend.dto.UserResponse;
import org.neurologybackend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        ResponseEntity<?> response = authService.login(request);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof org.neurologybackend.dto.LoginResponse loginResponse && loginResponse.success()) {
            ResponseCookie cookie = ResponseCookie.from("AUTH-TOKEN", loginResponse.token())
                    .httpOnly(true)
                    .path("/")
                    .sameSite("Lax")
                    .maxAge(86400)
                    .build();
            return ResponseEntity.ok()
                    .header("Set-Cookie", cookie.toString())
                    .body(loginResponse);
        }
        return response;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.currentUser(authentication.getName()));
    }
}
