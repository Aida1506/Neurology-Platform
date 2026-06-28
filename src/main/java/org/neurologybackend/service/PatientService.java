package org.neurologybackend.service;

import org.neurologybackend.dto.SymptomRequest;
import org.neurologybackend.model.Appointment;
import org.neurologybackend.model.ChatMessage;
import org.neurologybackend.model.Doctor;
import org.neurologybackend.model.Symptom;
import org.neurologybackend.repository.AppointmentRepository;
import org.neurologybackend.repository.ChatMessageRepository;
import org.neurologybackend.repository.DoctorRepository;
import org.neurologybackend.repository.SymptomRepository;
import org.neurologybackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class PatientService {

    private final SymptomRepository symptomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final NlpService nlpService;
    private final NeuroChatbotService neuroChatbotService;

    public PatientService(
            SymptomRepository symptomRepository,
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            NlpService nlpService,
            NeuroChatbotService neuroChatbotService
    ) {
        this.symptomRepository = symptomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.nlpService = nlpService;
        this.neuroChatbotService = neuroChatbotService;
    }

    public Symptom addSymptom(Symptom symptom) {
        symptom.setDate(LocalDate.now());
        assignDoctorIfMissing(symptom, null);
        return symptomRepository.save(symptom);
    }

    public Symptom addSymptom(SymptomRequest request) {
        Symptom symptom = new Symptom();
        symptom.setUsername(request.username());
        symptom.setSymptom(request.symptom());
        symptom.setSeverity(request.severity());
        symptom.setOriginalText(request.originalText());
        symptom.setDate(LocalDate.now());
        assignDoctorIfMissing(symptom, request.assignedDoctorId());
        return symptomRepository.save(symptom);
    }

    public Symptom addSymptomFromNaturalLanguage(String username, String naturalText, Integer doctorId) {
        String parsedSymptom = nlpService.parseSymptom(naturalText);
        Integer severity = nlpService.extractSeverity(naturalText);

        Symptom symptom = new Symptom();
        symptom.setUsername(username);
        symptom.setDate(LocalDate.now());
        symptom.setSymptom(parsedSymptom);
        symptom.setSeverity(severity);
        symptom.setOriginalText(naturalText);

        assignDoctorIfMissing(symptom, doctorId == null ? null : doctorId.longValue());

        return symptomRepository.save(symptom);
    }

    public List<Symptom> getTodaySymptoms(String username) {
        return symptomRepository.findByUsernameAndDate(username, LocalDate.now());
    }

    public List<Symptom> getPatientSymptoms(String patientUsername) {
        return symptomRepository.findByUsername(patientUsername);
    }

    public String chat(String username, String message) {
        return neuroChatbotService.chat(username, message);
    }

    private void assignDoctorIfMissing(Symptom symptom, Long doctorId) {
        if (doctorId != null) {
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            symptom.setAssignedDoctor(doctor);
            return;
        }

        if (symptom.getAssignedDoctor() != null || symptom.getUsername() == null) {
            return;
        }

        appointmentRepository.findByPatientUsername(symptom.getUsername())
                .stream()
                .filter(a -> a.getDoctor() != null)
                .max(Comparator.comparing(Appointment::getDateTime))
                .map(Appointment::getDoctor)
                .ifPresent(symptom::setAssignedDoctor);
    }
}
