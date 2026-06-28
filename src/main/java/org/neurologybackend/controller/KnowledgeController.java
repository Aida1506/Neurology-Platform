package org.neurologybackend.controller;

import org.neurologybackend.dto.KnowledgeIngestResponse;
import org.neurologybackend.dto.KnowledgeTextRequest;
import org.neurologybackend.service.NeuroChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    private final NeuroChatbotService neuroChatbotService;

    public KnowledgeController(NeuroChatbotService neuroChatbotService) {
        this.neuroChatbotService = neuroChatbotService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadKnowledge(
            @RequestParam("file") MultipartFile file
    ) {

        int chunks = neuroChatbotService.ingestFile(file);

        return ResponseEntity.ok(
                new KnowledgeIngestResponse("Document incarcat in baza vectoriala pentru chatbot Alzheimer.", chunks)
        );
    }

    @PostMapping("/text")
    public ResponseEntity<?> uploadKnowledgeText(
            @RequestBody KnowledgeTextRequest request
    ) {

        int chunks = neuroChatbotService.ingestText(
                request.title() == null ? "Document Alzheimer" : request.title(),
                request.text()
        );

        return ResponseEntity.ok(
                new KnowledgeIngestResponse("Text incarcat in baza vectoriala pentru chatbot Alzheimer.", chunks)
        );
    }
}
