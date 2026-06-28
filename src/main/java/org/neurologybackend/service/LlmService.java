package org.neurologybackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LlmService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LlmService() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(10_000);
        requestFactory.setReadTimeout(300_000);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    @Value("${llm.enabled:false}")
    private boolean enabled;

    @Value("${llm.base-url:http://127.0.0.1:11434/api/chat}")
    private String baseUrl;

    @Value("${llm.model:llama3.1}")
    private String model;

    @Value("${llm.api-key:}")
    private String apiKey;

    public String answerInRomanian(String question, List<String> contextDocuments) {
        if (!enabled) {
            return fallbackAnswer(contextDocuments);
        }

        String context = String.join("\n\n---\n\n", contextDocuments);

        List<Map<String, String>> messages = List.of(
                Map.of(
                        "role", "system",
                        "content",
                        "Esti un chatbot medical educational pentru pacienti, specializat pe Alzheimer si neurologie. "
                                + "Raspunzi exclusiv in limba romana, clar si coerent. Folosesti contextul primit ca sursa principala. "
                                + "Daca exista context partial, raspunde cu informatiile relevante gasite si mentioneaza pe scurt ce ramane de verificat cu medicul. "
                                + "Nu inventa doze, tratamente sau recomandari clinice specifice care nu apar in context. "
                                + "Evita sa raspunzi doar ca nu stii atunci cand contextul contine informatii utile. "
                                + "Raspunde in 2-5 propozitii scurte sau maximum 4 puncte. "
                                + "Nu pune diagnostic. Pentru decizii medicale, recomanda consult neurologic."
                ),
                Map.of(
                        "role", "user",
                        "content",
                        "Intrebarea pacientului:\n" + question
                                + "\n\nContext disponibil, singura sursa permisa:\n"
                                + context
                                + "\n\nRaspunde doar pe baza contextului de mai sus."
                )
        );

        Map<String, Object> body = isOllamaNativeEndpoint()
                ? Map.of(
                        "model", model,
                        "stream", false,
                        "options", Map.of(
                                "temperature", 0.1,
                                "num_predict", 180,
                                "num_ctx", 2048
                        ),
                        "messages", messages
                )
                : Map.of(
                        "model", model,
                        "temperature", 0.1,
                        "stream", false,
                        "max_tokens", 300,
                        "messages", messages
                );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isBlank()) {
                headers.setBearerAuth(apiKey);
            }

            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode content = isOllamaNativeEndpoint()
                    ? root.path("message").path("content")
                    : root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || content.asText().isBlank()) {
                return fallbackAnswer(contextDocuments);
            }

            return cleanChatbotAnswer(content.asText());
        } catch (Exception e) {
            System.err.println("Ollama request failed at " + baseUrl + " with model " + model + ": " + e.getMessage());
            e.printStackTrace();
            return fallbackAnswer(contextDocuments)
                    + "\n\nNota: modelul de generare in romana nu a raspuns la timp sau nu este disponibil momentan.";
        }
    }

    private boolean isOllamaNativeEndpoint() {
        return baseUrl != null && baseUrl.contains("/api/chat");
    }

    private String cleanChatbotAnswer(String answer) {
        if (answer == null) {
            return "";
        }

        return answer
                .replaceAll("(?i)^\\s*as an ai[^.?!]*[.?!]\\s*", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public String fallbackAnswer(List<String> contextDocuments) {
        StringBuilder answer = new StringBuilder();
        answer.append("Nu pot formula un raspuns complet fara modelul LLM, dar am gasit aceste fragmente relevante in materialele incarcate:\n\n");

        for (int i = 0; i < contextDocuments.size(); i++) {
            answer.append(i + 1)
                    .append(". ")
                    .append(shorten(contextDocuments.get(i)))
                    .append("\n\n");
        }

        answer.append("Acest raspuns este informativ si nu inlocuieste consultul neurologic.");
        return answer.toString();
    }

    private String shorten(String text) {
        if (text == null) {
            return "";
        }

        if (text.length() <= 700) {
            return text;
        }

        return text.substring(0, 700).trim() + "...";
    }

}
