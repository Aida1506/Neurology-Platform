package org.neurologybackend.controller;

import org.neurologybackend.dto.ChangePasswordRequest;
import org.neurologybackend.dto.ForgotPasswordRequest;
import org.neurologybackend.dto.MessageResponse;
import org.neurologybackend.dto.ResetPasswordRequest;
import org.neurologybackend.dto.UpdateProfileRequest;
import org.neurologybackend.service.SettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username) {
        String current = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!current.equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Nu ai dreptul sa accesezi acest profil."));
        }
        return ResponseEntity.ok(settingsService.getProfile(username));
    }

    @PutMapping("/{username}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String username,
            @RequestBody UpdateProfileRequest request
    ) {
        String current = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!current.equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Nu ai dreptul sa actualizezi acest cont."));
        }
        try {
            return ResponseEntity.ok(settingsService.updateProfile(username, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{username}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable String username,
            @RequestBody ChangePasswordRequest request
    ) {
        String current = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!current.equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Nu ai dreptul sa schimbi parola acestui cont."));
        }
        try {
            settingsService.changePassword(username, request);
            return ResponseEntity.ok(new MessageResponse("Parola a fost schimbata."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            return ResponseEntity.ok(settingsService.requestPasswordReset(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            settingsService.resetPassword(request);
            return ResponseEntity.ok(new MessageResponse("Parola a fost resetata."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }
}
