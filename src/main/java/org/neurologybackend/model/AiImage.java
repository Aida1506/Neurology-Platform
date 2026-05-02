package org.neurologybackend.model;

import jakarta.persistence.*;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
public class AiImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    private String filename;

    private String username;

    @Setter
    @Lob
    private String resultJson;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imageData;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // 🔥 IMPORTANT: se setează automat la salvare
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // 🔹 GETTERS

    public Long getId() {
        return id;
    }

    public String getFilename() {
        return filename;
    }

    public String getResultJson() {
        return resultJson;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public String getUsername() {
        return username;
    }

    public LocalDateTime getCreatedAt() { // 🔥 LIPSEA
        return createdAt;
    }

    // 🔹 SETTERS

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}