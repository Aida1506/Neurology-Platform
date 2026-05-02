package org.neurologybackend.service;

import org.neurologybackend.model.*;
import org.neurologybackend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final SymptomRepository symptomRepository;
    private final MedicalTestRepository medicalTestRepository;
    private final DeviceDataRepository deviceDataRepository;
    private final ChatMessageRepository chatMessageRepository;

    public DashboardService(
            SymptomRepository symptomRepository,
            MedicalTestRepository medicalTestRepository,
            DeviceDataRepository deviceDataRepository,
            ChatMessageRepository chatMessageRepository) {
        this.symptomRepository = symptomRepository;
        this.medicalTestRepository = medicalTestRepository;
        this.deviceDataRepository = deviceDataRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    public List<MedicalTest> getAnalyses(String username) {
        return medicalTestRepository.findByUsernameOrderByDateUploadedDesc(username);
    }

    public Symptom addSymptom(Symptom symptom) {
        symptom.setDate(LocalDate.now());
        return symptomRepository.save(symptom);
    }

    public List<Symptom> getTodaySymptoms(String username) {
        return symptomRepository.findByUsernameAndDate(username, LocalDate.now());
    }

    public List<DeviceData> getDeviceData(String username) {
        return deviceDataRepository.findByUsernameOrderByTimestampDesc(username);
    }

    public String chat(String username, String message) {
        String reply = "Acesta este un răspuns AI pentru: " + message;

        ChatMessage userMsg = new ChatMessage();
        userMsg.setUsername(username);
        userMsg.setRole("user");
        userMsg.setMessage(message);
        chatMessageRepository.save(userMsg);

        ChatMessage botMsg = new ChatMessage();
        botMsg.setUsername(username);
        botMsg.setRole("bot");
        botMsg.setMessage(reply);
        chatMessageRepository.save(botMsg);

        return reply;
    }
}
