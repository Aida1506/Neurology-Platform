package org.neurologybackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.neurologybackend.model.AiImage;
import org.neurologybackend.model.User;
import org.neurologybackend.repository.AiImageRepository;
import org.neurologybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AiImageRepository aiImageRepository;
    private final UserRepository userRepository;

    @Value("${ai.python-url:http://127.0.0.1:8000}")
    private String pythonUrl;

    public AiService(
            AiImageRepository aiImageRepository,
            UserRepository userRepository
    ) {
        this.aiImageRepository = aiImageRepository;
        this.userRepository = userRepository;
    }

    public String predict(byte[] imageBytes) {
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    pythonUrl + "/predict",
                    multipartRequest(imageBytes),
                    String.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Python AI returned error: " + response.getStatusCode());
            }

            return response.getBody();
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new IllegalArgumentException(extractErrorMessage(e.getResponseBodyAsString()), e);
            }

            throw new RuntimeException("AI service failed: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("AI service failed: " + e.getMessage(), e);
        }
    }

    public AiImage saveResult(
            String username,
            String filename,
            String result,
            byte[] imageBytes
    ) {
        User patient = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AiImage img = new AiImage();
        img.setFilename(filename);
        img.setResultJson(result);
        img.setImageData(imageBytes);
        img.setPatient(patient);
        img.setCreatedAt(LocalDateTime.now());
        img.setApproved(false);
        img.setRejected(false);
        img.setValidationStatus("PENDING");
        parsePrediction(img);

        return aiImageRepository.save(img);
    }

    public AiImage validateImage(Long imageId, boolean approved, String doctorComment) {
        AiImage img = aiImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        img.setApproved(approved);
        img.setRejected(!approved);
        img.setDoctorComment(doctorComment);
        img.setValidationStatus(approved ? "APPROVED" : "REJECTED");
        img.setApprovedAt(LocalDateTime.now());
        parsePrediction(img);

        return aiImageRepository.save(img);
    }

    public List<AiImage> getPatientHistory(String username) {
        return aiImageRepository.findByPatient_Username(username);
    }

    private HttpEntity<MultiValueMap<String, Object>> multipartRequest(byte[] imageBytes) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource resource = new ByteArrayResource(imageBytes) {
            @Override
            public String getFilename() {
                return "image.jpg";
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);

        return new HttpEntity<>(body, headers);
    }

    private void parsePrediction(AiImage image) {
        if (image.getResultJson() == null || image.getResultJson().isBlank()) {
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(image.getResultJson());
            JsonNode diseaseNode = firstPresent(root, "disease", "class", "prediction", "label");
            JsonNode confidenceNode = firstPresent(root, "confidence", "probability", "score");

            if (diseaseNode != null && !diseaseNode.isNull()) {
                image.setDisease(diseaseNode.asText());
            }

            if (confidenceNode != null && confidenceNode.isNumber()) {
                image.setConfidence(confidenceNode.asDouble());
            }
        } catch (Exception ignored) {
            image.setDisease(image.getResultJson());
        }
    }

    private JsonNode firstPresent(JsonNode root, String... names) {
        for (String name : names) {
            JsonNode value = root.get(name);
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String extractErrorMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "Imagine invalida. Te rog incarca o imagine RMN valida.";
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode detail = root.get("detail");
            if (detail != null && !detail.asText().isBlank()) {
                return detail.asText();
            }
        } catch (Exception ignored) {
            return responseBody;
        }

        return "Imagine invalida. Te rog incarca o imagine RMN valida.";
    }
}
