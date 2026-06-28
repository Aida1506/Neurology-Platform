package org.neurologybackend.dto;

public record NaturalSymptomRequest(
        String text,
        Integer doctorId
) {
}
