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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ChromaService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${chroma.enabled:false}")
    private boolean enabled;

    @Value("${chroma.url:http://localhost:8000}")
    private String chromaUrl;

    @Value("${chroma.tenant:default_tenant}")
    private String tenant;

    @Value("${chroma.database:default_database}")
    private String database;

    @Value("${chroma.collection:alzheimer_knowledge}")
    private String collectionName;

    @Value("${chroma.token:}")
    private String token;

    public boolean isEnabled() {
        return enabled;
    }

    public void upsert(String sourceTitle, List<String> documents, List<double[]> embeddings) {
        if (!enabled) {
            throw new RuntimeException("Chroma is disabled.");
        }

        String collectionId = getOrCreateCollectionId();
        int batchSize = 25;

        for (int start = 0; start < documents.size(); start += batchSize) {
            int end = Math.min(start + batchSize, documents.size());
            upsertBatch(collectionId, sourceTitle, documents.subList(start, end), embeddings.subList(start, end));
        }
    }

    private void upsertBatch(
            String collectionId,
            String sourceTitle,
            List<String> documents,
            List<double[]> embeddings
    ) {
        List<String> ids = new ArrayList<>();
        List<Map<String, Object>> metadatas = new ArrayList<>();
        List<List<Double>> embeddingLists = new ArrayList<>();

        for (int i = 0; i < documents.size(); i++) {
            ids.add(sourceTitle + "-" + UUID.randomUUID());
            metadatas.add(Map.of(
                    "source", sourceTitle,
                    "topic", "ALZHEIMER"
            ));
            embeddingLists.add(toList(embeddings.get(i)));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("ids", ids);
        body.put("documents", documents);
        body.put("embeddings", embeddingLists);
        body.put("metadatas", metadatas);

        post(collectionPath(collectionId) + "/add", body);
    }

    public List<String> query(double[] queryEmbedding, int nResults) {
        if (!enabled) {
            return List.of();
        }

        String collectionId = getOrCreateCollectionId();
        Map<String, Object> body = new HashMap<>();
        body.put("query_embeddings", List.of(toList(queryEmbedding)));
        body.put("n_results", nResults);
        body.put("include", List.of("documents", "distances", "metadatas"));

        ResponseEntity<String> response = post(collectionPath(collectionId) + "/query", body);
        return extractDocuments(response.getBody());
    }

    private String getOrCreateCollectionId() {
        JsonNode existing = findCollection();
        if (existing != null) {
            return existing.get("id").asText();
        }

        Map<String, Object> body = new HashMap<>();
        body.put("name", collectionName);
        body.put("get_or_create", true);
        body.put("metadata", Map.of("description", "Alzheimer knowledge base"));
        body.put("schema", null);
        body.put("configuration", null);

        ResponseEntity<String> response = post(collectionsPath(), body);
        try {
            return objectMapper.readTree(response.getBody()).get("id").asText();
        } catch (Exception e) {
            throw new RuntimeException("Could not parse Chroma collection creation response.", e);
        }
    }

    private JsonNode findCollection() {
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url(collectionsPath()),
                    HttpMethod.GET,
                    new HttpEntity<>(headers()),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.isArray()) {
                for (JsonNode collection : root) {
                    if (collectionName.equals(collection.path("name").asText())) {
                        return collection;
                    }
                }
            }
            return null;
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Could not connect to Chroma at " + chromaUrl + ". Make sure Chroma is running.", e);
        }
    }

    private List<String> extractDocuments(String json) {
        try {
            JsonNode documents = objectMapper.readTree(json).path("documents");
            if (!documents.isArray() || documents.isEmpty() || !documents.get(0).isArray()) {
                return List.of();
            }

            List<String> results = new ArrayList<>();
            for (JsonNode document : documents.get(0)) {
                if (!document.isNull()) {
                    results.add(document.asText());
                }
            }
            return results;
        } catch (Exception e) {
            throw new RuntimeException("Could not parse Chroma query response.", e);
        }
    }

    private ResponseEntity<String> post(String path, Map<String, Object> body) {
        try {
            return restTemplate.exchange(
                    url(path),
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers()),
                    String.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Chroma request failed at " + url(path), e);
        }
    }

    private HttpHeaders headers() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null && !token.isBlank()) {
            headers.set("x-chroma-token", token);
        }
        return headers;
    }

    private String collectionsPath() {
        return "/api/v2/tenants/" + tenant + "/databases/" + database + "/collections";
    }

    private String collectionPath(String collectionId) {
        return collectionsPath() + "/" + collectionId;
    }

    private String url(String path) {
        return chromaUrl.replaceAll("/+$", "") + path;
    }

    private List<Double> toList(double[] vector) {
        List<Double> values = new ArrayList<>(vector.length);
        for (double value : vector) {
            values.add(value);
        }
        return values;
    }
}
