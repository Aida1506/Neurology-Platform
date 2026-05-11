package org.neurologybackend.service;

import org.neurologybackend.model.*;
import org.neurologybackend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PatientService {

    private final SymptomRepository symptomRepository;
    private final ChatMessageRepository chatMessageRepository;

    public PatientService(
            SymptomRepository symptomRepository,
            ChatMessageRepository chatMessageRepository) {
        this.symptomRepository = symptomRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    public Symptom addSymptom(Symptom symptom) {
        symptom.setDate(LocalDate.now());
        return symptomRepository.save(symptom);
    }

    public List<Symptom> getTodaySymptoms(String username) {
        return symptomRepository.findByUsernameAndDate(username, LocalDate.now());
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
