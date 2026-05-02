package org.neurologybackend.service;

import org.neurologybackend.model.AiImage;
import org.neurologybackend.repository.AiImageRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class AiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final AiImageRepository aiImageRepository;

    private final String PYTHON_URL = "http://localhost:8000";

    // 🔥 constructor injection (obligatoriu)
    public AiService(AiImageRepository aiImageRepository) {
        this.aiImageRepository = aiImageRepository;
    }

    // ---------------- PREDICT ----------------
    public String predict(byte[] imageBytes) {

        try {
            System.out.println("➡️ CALLING PYTHON AI...");

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

            HttpEntity<MultiValueMap<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "http://127.0.0.1:8000/predict", // 🔥 schimbat localhost → 127.0.0.1
                    request,
                    String.class
            );

            System.out.println("✅ PYTHON RESPONSE: " + response.getBody());

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Python AI returned error: " + response.getStatusCode());
            }

            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 IMPORTANT

            throw new RuntimeException("AI service failed: " + e.getMessage());
        }
    }

    // ---------------- GRADCAM ----------------
    public byte[] gradcam(byte[] imageBytes) {

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

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                PYTHON_URL + "/gradcam",
                HttpMethod.POST,
                request,
                byte[].class
        );

        return response.getBody();
    }

    // ---------------- SAVE ----------------
    public AiImage saveResult(String filename, String result, byte[] imageBytes) {
        AiImage img = new AiImage();
        img.setFilename(filename);
        img.setResultJson(result);
        img.setImageData(imageBytes);

        return aiImageRepository.save(img);
    }
}