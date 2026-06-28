package org.neurologybackend.service;

import org.neurologybackend.dto.DoctorRequest;
import org.neurologybackend.dto.RegisterRequest;
import org.neurologybackend.model.AiImage;
import org.neurologybackend.model.Appointment;
import org.neurologybackend.model.Doctor;
import org.neurologybackend.model.DoctorAvailability;
import org.neurologybackend.model.Symptom;
import org.neurologybackend.model.User;
import org.neurologybackend.repository.AiImageRepository;
import org.neurologybackend.repository.AppointmentRepository;
import org.neurologybackend.repository.DoctorAvailabilityRepository;
import org.neurologybackend.repository.DoctorRepository;
import org.neurologybackend.repository.SymptomRepository;
import org.neurologybackend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.text.Normalizer;
import java.util.ArrayDeque;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Queue;
import java.util.Set;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final AiImageRepository aiImageRepository;
    private final SymptomRepository symptomRepository;
    private final UserRepository userRepository;
    private final AiService aiService;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(
            DoctorRepository doctorRepository,
            DoctorAvailabilityRepository availabilityRepository,
            AppointmentRepository appointmentRepository,
            AiImageRepository aiImageRepository,
            SymptomRepository symptomRepository,
            UserRepository userRepository,
            AiService aiService,
            PasswordEncoder passwordEncoder
    ) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.appointmentRepository = appointmentRepository;
        this.aiImageRepository = aiImageRepository;
        this.symptomRepository = symptomRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
        this.passwordEncoder = passwordEncoder;
    }

    public Doctor createDoctor(Doctor doctor) {
        if (doctor.getUser() != null) {
            User user = doctor.getUser();
            if (user.getRole() == null || user.getRole().isBlank()) {
                user.setRole("DOCTOR");
            }
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                user.setPassword(user.getUsername());
            }
            encodePasswordIfNeeded(user);
            doctor.setUser(userRepository.save(user));
            return doctorRepository.save(doctor);
        }

        Doctor savedDoctor = doctorRepository.save(doctor);
        ensureDoctorHasUser(savedDoctor, new ArrayDeque<>());
        return doctorRepository.save(savedDoctor);
    }

    public Doctor createDoctor(DoctorRequest request) {
        Doctor doctor = new Doctor();
        doctor.setFullName(request.fullName());
        doctor.setSpecialization(request.specialization());
        doctor.setHospital(request.hospital());

        RegisterRequest userRequest = request.user();
        if (userRequest != null) {
            User user = new User();
            user.setUsername(userRequest.username());
            user.setEmail(userRequest.email());
            user.setPassword(userRequest.password());
            user.setRole(userRequest.role());
            doctor.setUser(user);
        }

        return createDoctor(doctor);
    }

    public List<Doctor> syncDoctorUsers() {
        List<Doctor> doctors = doctorRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Doctor::getId))
                .toList();

        List<User> genericDoctorUsers = userRepository.findAll()
                .stream()
                .filter(this::isGenericDoctorUsername)
                .sorted(Comparator.comparing(User::getUsername))
                .toList();

        if (genericDoctorUsers.size() >= doctors.size()) {
            for (int i = 0; i < doctors.size(); i++) {
                User user = genericDoctorUsers.get(i);
                user.setRole("DOCTOR");
                encodePasswordIfNeeded(user);
                userRepository.save(user);

                Doctor doctor = doctors.get(i);
                doctor.setUser(user);
                doctorRepository.save(doctor);
            }

            return doctorRepository.findAll();
        }

        Set<Integer> linkedUserIds = new HashSet<>();
        doctors.stream()
                .map(Doctor::getUser)
                .filter(user -> user != null && user.getId() != null)
                .forEach(user -> linkedUserIds.add(user.getId()));

        Queue<User> unlinkedDoctorUsers = new ArrayDeque<>(
                userRepository.findAll()
                        .stream()
                        .filter(this::isDoctorLoginCandidate)
                        .filter(user -> user.getId() != null && !linkedUserIds.contains(user.getId()))
                        .sorted(Comparator.comparing(User::getId))
                        .toList()
        );

        for (Doctor doctor : doctors) {
            ensureDoctorHasUser(doctor, unlinkedDoctorUsers);
        }

        return doctorRepository.findAll();
    }

    public AiImage validateImage(Long imageId, boolean approved, String doctorComment) {
        AiImage image = aiService.validateImage(imageId, approved, doctorComment);
        if (approved && image.getDoctor() != null) {
            refreshNeurologicalStatus(image.getDoctor().getId());
        }
        return image;
    }

    public DoctorAvailability addAvailability(
            Long doctorId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    ) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctor(doctor);
        availability.setDate(date);
        availability.setStartTime(startTime);
        availability.setEndTime(endTime);
        availability.setStatus("AVAILABLE");

        return availabilityRepository.save(availability);
    }

    public List<DoctorAvailability> getDoctorAvailabilities(Long doctorId) {
        return availabilityRepository.findByDoctorId(doctorId);
    }

    public List<DoctorAvailability> getAvailabilityForDate(Long doctorId, LocalDate date) {
        return availabilityRepository.findByDoctorIdAndDateAndStatus(doctorId, date, "AVAILABLE");
    }

    public DoctorAvailability bookAvailability(Long availabilityId) {
        DoctorAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        availability.setStatus("BOOKED");
        return availabilityRepository.save(availability);
    }

    public void cancelAvailability(Long availabilityId) {
        DoctorAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        availability.setStatus("CANCELLED");
        availabilityRepository.save(availability);
    }

    public List<AiImage> getPendingValidations(Long doctorId) {
        return aiImageRepository.findByDoctorIdAndApprovedFalseAndRejectedFalse(doctorId);
    }

    public List<AiImage> getValidatedImages(Long doctorId) {
        return aiImageRepository.findByDoctorIdAndValidationStatus(doctorId, "APPROVED");
    }

    public List<Symptom> getPatientSymptoms(String patientUsername) {
        return symptomRepository.findByUsername(patientUsername);
    }

    public List<String> getAssignedPatientUsernames(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(Appointment::getPatientUsername)
                .distinct()
                .toList();
    }

    public Doctor updateNeurologicalStatus(Long doctorId, String status) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setNeurologicalStatus(status);
        return doctorRepository.save(doctor);
    }

    public String getNeurologicalStatus(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return doctor.getNeurologicalStatus();
    }

    public List<Appointment> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    private void refreshNeurologicalStatus(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<AiImage> approvedImages = aiImageRepository.findByDoctorIdAndValidationStatus(
                doctorId,
                "APPROVED"
        );

        if (approvedImages.isEmpty()) {
            return;
        }

        AiImage latest = approvedImages.get(approvedImages.size() - 1);
        String disease = latest.getDisease() != null ? latest.getDisease() : "predictie AI validata";
        String confidence = latest.getConfidence() != null
                ? String.format("%.2f%%", latest.getConfidence() * 100)
                : "n/a";

        doctor.setNeurologicalStatus(
                "Ultima predictie RMN validata: " + disease
                        + " (confidence: " + confidence + "). "
                        + "Actualizat la " + latest.getApprovedAt()
        );

        doctorRepository.save(doctor);
    }

    private void ensureDoctorHasUser(Doctor doctor, Queue<User> reusableDoctorUsers) {
        if (doctor.getUser() != null) {
            User user = doctor.getUser();
            if (user.getRole() == null || !user.getRole().equalsIgnoreCase("DOCTOR")) {
                user.setRole("DOCTOR");
            }
            encodePasswordIfNeeded(user);
            userRepository.save(user);
            return;
        }

        User user = reusableDoctorUsers.poll();
        if (user == null) {
            user = new User();
            String username = uniqueDoctorUsername(doctor);
            user.setUsername(username);
            user.setPassword(username);
            user.setRole("DOCTOR");
            encodePasswordIfNeeded(user);
            user = userRepository.save(user);
        } else {
            user.setRole("DOCTOR");
            encodePasswordIfNeeded(user);
            userRepository.save(user);
        }

        doctor.setUser(user);
        doctorRepository.save(doctor);
    }

    private void encodePasswordIfNeeded(User user) {
        String password = user.getPassword();
        if (password == null || password.isBlank() || isBcrypt(password)) {
            return;
        }

        user.setPassword(passwordEncoder.encode(password));
    }

    private boolean isBcrypt(String password) {
        return password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$");
    }

    private String uniqueDoctorUsername(Doctor doctor) {
        String base = normalizeUsername(doctor.getFullName());
        if (base.isBlank()) {
            base = "doctor" + doctor.getId();
        }

        String candidate = base;
        int suffix = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            candidate = base + suffix;
            suffix++;
        }

        return candidate;
    }

    private String normalizeUsername(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
    }

    private boolean isDoctorLoginCandidate(User user) {
        if (user.getRole() != null && user.getRole().equalsIgnoreCase("DOCTOR")) {
            return true;
        }

        return isGenericDoctorUsername(user);
    }

    private boolean isGenericDoctorUsername(User user) {
        return user.getUsername() != null
                && user.getUsername().toLowerCase(Locale.ROOT).matches("doctor\\d+");
    }
}
