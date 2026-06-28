package org.neurologybackend.dto;

public record ValidateImageRequest(
        Boolean approved,
        String comment
) {
}
