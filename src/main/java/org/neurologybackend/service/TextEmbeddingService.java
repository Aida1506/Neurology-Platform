package org.neurologybackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;

@Service
public class TextEmbeddingService {

    private static final int DIMENSIONS = 256;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public double[] embed(String text) {
        double[] vector = new double[DIMENSIONS];
        String normalized = normalize(text);

        for (String token : normalized.split("\\s+")) {
            if (token.length() < 3) {
                continue;
            }

            int index = Math.floorMod(token.hashCode(), DIMENSIONS);
            vector[index] += 1.0;
        }

        normalizeVector(vector);
        return vector;
    }

    public double similarity(double[] left, double[] right) {
        double score = 0.0;
        for (int i = 0; i < Math.min(left.length, right.length); i++) {
            score += left[i] * right[i];
        }
        return score;
    }

    public String toJson(double[] embedding) {
        try {
            return objectMapper.writeValueAsString(embedding);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Could not serialize embedding", e);
        }
    }

    public double[] fromJson(String json) {
        try {
            return objectMapper.readValue(json, double[].class);
        } catch (Exception e) {
            return new double[DIMENSIONS];
        }
    }

    private void normalizeVector(double[] vector) {
        double norm = 0.0;
        for (double value : vector) {
            norm += value * value;
        }

        norm = Math.sqrt(norm);
        if (norm == 0.0) {
            return;
        }

        for (int i = 0; i < vector.length; i++) {
            vector[i] = vector[i] / norm;
        }
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }

        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
