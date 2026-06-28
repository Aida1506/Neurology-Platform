package org.neurologybackend.service;

import org.neurologybackend.dto.ChangePasswordRequest;
import org.neurologybackend.dto.ForgotPasswordRequest;
import org.neurologybackend.dto.ForgotPasswordResponse;
import org.neurologybackend.dto.ProfileResponse;
import org.neurologybackend.dto.ResetPasswordRequest;
import org.neurologybackend.dto.UpdateProfileRequest;
import org.neurologybackend.model.PasswordResetToken;
import org.neurologybackend.model.User;
import org.neurologybackend.repository.PasswordResetTokenRepository;
import org.neurologybackend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class SettingsService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${spring.mail.host:}")
    private String mailHost;

    public SettingsService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            ObjectProvider<JavaMailSender> mailSenderProvider
            , PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSenderProvider = mailSenderProvider;
        this.passwordEncoder = passwordEncoder;
    }

    public ProfileResponse getProfile(String username) {
        User user = findByUsername(username);
        return ProfileResponse.from(user);
    }

    public ProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = findByUsername(username);
        String email = request.email();

        if (email != null && !email.isBlank()) {
            String cleanedEmail = email.trim();
            userRepository.findByEmail(cleanedEmail)
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new RuntimeException("Emailul este deja folosit de alt cont.");
                    });
            user.setEmail(cleanedEmail);
        } else {
            user.setEmail(null);
        }

        userRepository.save(user);
        return getProfile(username);
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = findByUsername(username);
        String currentPassword = clean(request.currentPassword());
        String newPassword = clean(request.newPassword());

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Parola curenta nu este corecta.");
        }

        validateNewPassword(newPassword);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public ForgotPasswordResponse requestPasswordReset(ForgotPasswordRequest request) {
        String email = clean(request.email());
        if (email.isBlank()) {
            email = clean(request.usernameOrEmail());
        }

        if (email.isBlank()) {
            throw new RuntimeException("Introdu adresa de email.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nu exista cont cu aceasta adresa de email."));

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Contul nu are email salvat. Adauga emailul din setari sau contacteaza administratorul.");
        }

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);

        String resetLink = frontendUrl.replaceAll("/+$", "") + "/reset-password?token=" + resetToken.getToken();
        boolean emailSent = sendResetEmail(user.getEmail(), resetLink);

        if (!emailSent) {
            throw new RuntimeException("Emailul de resetare nu a putut fi trimis. Verifica setarile SMTP.");
        }

        return new ForgotPasswordResponse(
                "Emailul de resetare a fost trimis.",
                true
        );
    }

    public void resetPassword(ResetPasswordRequest request) {
        String token = clean(request.token());
        String newPassword = clean(request.newPassword());
        validateNewPassword(newPassword);

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalid."));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Tokenul a fost deja folosit.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Tokenul a expirat.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    private boolean sendResetEmail(String to, String resetLink) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || mailHost == null || mailHost.isBlank()) {
            System.err.println("SMTP nu este configurat. Emailul de resetare nu poate fi trimis.");
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Resetare parola Cerebra");
            message.setText("Pentru resetarea parolei, acceseaza linkul:\n\n" + resetLink + "\n\nLinkul expira in 30 de minute.");
            if (mailFrom != null && !mailFrom.isBlank()) {
                message.setFrom(mailFrom);
            }
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            System.err.println("Nu am putut trimite emailul de resetare: " + e.getMessage());
            return false;
        }
    }

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    private void validateNewPassword(String password) {
        if (password == null || password.length() < 4) {
            throw new RuntimeException("Parola noua trebuie sa aiba minim 4 caractere.");
        }
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
