package org.neurologybackend.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String message;

    private String role;
    private LocalDate timestamp;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDate getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDate timestamp) { this.timestamp = timestamp; }

}
