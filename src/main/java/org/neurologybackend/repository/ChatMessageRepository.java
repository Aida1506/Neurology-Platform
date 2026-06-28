package org.neurologybackend.repository;

import org.neurologybackend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findTop6ByUsernameOrderByIdDesc(String username);
}

