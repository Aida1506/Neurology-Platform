package org.neurologybackend.service;

import org.neurologybackend.model.ChatMessage;
import org.neurologybackend.model.KnowledgeChunk;
import org.neurologybackend.repository.ChatMessageRepository;
import org.neurologybackend.repository.KnowledgeChunkRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class NeuroChatbotService {

    private static final String TOPIC = "ALZHEIMER";
    private static final int CHUNK_SIZE = 900;
    private static final int CHUNK_OVERLAP = 160;
    private static final int MIN_CONTEXT_SCORE = 1;
    private static final String UNKNOWN_REPLY = "Nu stiu sigur din materialele incarcate. Nu am gasit suficient context relevant ca sa raspund corect la intrebarea ta. Poti reformula intrebarea sau poti incarca un document medical relevant despre Alzheimer/neurologie.";
    private static final List<String> ALZHEIMER_TERMS = List.of(
            "alzheimer",
            "dement",
            "memory",
            "memorie",
            "cognitive",
            "cognitiv",
            "forget",
            "uitare",
            "orientation",
            "orientare",
            "language",
            "limbaj",
            "behavior",
            "comportament",
            "symptom",
            "simptom",
            "confusion",
            "confuzie",
            "boala",
            "cauza",
            "cauze",
            "tratament",
            "medicament",
            "diagnostic",
            "investigatie",
            "rmn",
            "ct",
            "stadiu",
            "stadii",
            "risc",
            "factori",
            "preventie",
            "ingrijire",
            "familie",
            "pacient",
            "doctor",
            "medic",
            "donepezil",
            "rivastigmina",
            "memantina"
    );

    private final KnowledgeChunkRepository knowledgeChunkRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final TextEmbeddingService embeddingService;
    private final ChromaService chromaService;
    private final LlmService llmService;

    public NeuroChatbotService(
            KnowledgeChunkRepository knowledgeChunkRepository,
            ChatMessageRepository chatMessageRepository,
            TextEmbeddingService embeddingService,
            ChromaService chromaService,
            LlmService llmService
    ) {
        this.knowledgeChunkRepository = knowledgeChunkRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.embeddingService = embeddingService;
        this.chromaService = chromaService;
        this.llmService = llmService;
    }

    public int ingestText(String sourceTitle, String text) {
        String cleaned = cleanText(text);
        if (cleaned.isBlank()) {
            throw new RuntimeException("Documentul nu contine text valid.");
        }

        List<String> chunks = chunk(cleaned);
        List<double[]> embeddings = chunks.stream()
                .map(embeddingService::embed)
                .toList();

        if (chromaService.isEnabled()) {
            chromaService.upsert(sourceTitle, chunks, embeddings);
            return chunks.size();
        }

        int count = 0;
        for (int i = 0; i < chunks.size(); i++) {
            String chunkText = chunks.get(i);
            KnowledgeChunk chunk = new KnowledgeChunk();
            chunk.setSourceTitle(sourceTitle);
            chunk.setTopic(TOPIC);
            chunk.setContent(chunkText);
            chunk.setEmbeddingJson(embeddingService.toJson(embeddings.get(i)));
            chunk.setCreatedAt(LocalDateTime.now());
            knowledgeChunkRepository.save(chunk);
            count++;
        }

        return count;
    }

    public int ingestFile(MultipartFile file) {
        String text;
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase(Locale.ROOT) : "";

        try {
            if (filename.endsWith(".pdf")) {
                try (PDDocument document = PDDocument.load(file.getInputStream())) {
                    text = new PDFTextStripper().getText(document);
                }
            } else {
                text = new String(file.getBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            throw new RuntimeException("Nu am putut citi fisierul. Incarca un .txt sau un PDF cu text selectabil.", e);
        }

        return ingestText(file.getOriginalFilename(), text);
    }

    public String chat(String username, String question) {
        saveMessage(username, "user", question);

        String reply;
        if (!isAllowedTopic(username, question)) {
            reply = "Pot raspunde doar la intrebari despre neurologie si boala Alzheimer. Te rog formuleaza intrebarea in acest domeniu.";
            saveMessage(username, "bot", reply);
            return reply;
        }

        String directReply = directRomanianAnswer(username, question);
        if (directReply != null) {
            saveMessage(username, "bot", directReply);
            return directReply;
        }

        List<String> contextDocuments = search(question);
        if (contextDocuments.isEmpty()) {
            reply = staticRomanianAnswer(question);
            if (reply == null) {
                reply = UNKNOWN_REPLY;
            }
            saveMessage(username, "bot", reply);
            return reply;
        }

        reply = llmService.answerInRomanian(question, contextDocuments);
        if (isLowQualityAnswer(reply)) {
            reply = staticRomanianAnswer(question);
            if (reply == null) {
                reply = llmService.fallbackAnswer(contextDocuments);
            }
        }
        if (reply.contains("Nota: modelul de generare in romana")) {
            String staticReply = staticRomanianAnswer(question);
            if (staticReply != null) {
                reply = staticReply;
            }
        }
        saveMessage(username, "bot", reply);
        return reply;
    }

    private String directRomanianAnswer(String username, String question) {
        String q = normalize(question);
        if (q.contains("simptom") && q.contains("alzheimer")) {
            return "Simptomele frecvente in boala Alzheimer includ pierderi de memorie recente, confuzie, dificultati de orientare, probleme de limbaj, schimbari de comportament sau personalitate, scaderea judecatii si dificultati in activitatile zilnice. De obicei, istoricul trebuie completat si de o persoana apropiata pacientului, pentru ca pacientul poate sa nu observe gravitatea problemelor. Acest raspuns este informativ si nu inlocuieste consultul neurologic.";
        }

        if ((q.contains("cum imi dau seama") || q.contains("cum stiu") || q.contains("posibil sa am"))
                && hasRecentAlzheimerContext(username, q)) {
            return "Nu pot spune daca ai sau nu Alzheimer pe baza unei conversatii. Semnele care merita discutate cu un neurolog includ pierderi de memorie care se repeta, confuzie, dificultati de orientare, probleme de limbaj, schimbari de comportament si dificultati in activitatile zilnice. Daca observi astfel de schimbari, noteaza exemple concrete si discuta cu medicul de familie sau cu un neurolog.";
        }

        if (q.contains("durere de cap") || q.contains("ma doare capul") || q.contains("dureri de cap")) {
            return "Pentru durere de cap, odihneste-te, hidrateaza-te si urmareste daca durerea se repeta sau se agraveaza. Cere ajutor medical urgent daca durerea este brusca si foarte intensa, apare cu slabiciune pe o parte, tulburari de vorbire, confuzie, febra mare, varsaturi persistente sau dupa un traumatism. Pentru dureri repetate, programeaza un consult medical.";
        }

        return null;
    }

    private String staticRomanianAnswer(String question) {
        String q = normalize(question);
        if ((q.contains("ce este") || q.contains("ce inseamna") || q.contains("definitie"))
                && (q.contains("alzheimer") || q.contains("dement"))) {
            return "Boala Alzheimer este o afectiune neurodegenerativa in care functiile cognitive, mai ales memoria si orientarea, se degradeaza treptat. Poate afecta limbajul, comportamentul, judecata si activitatile zilnice. Raspunsul este informativ si nu inlocuieste consultul neurologic.";
        }

        if (q.contains("simptom") && q.contains("alzheimer")) {
            return "Simptomele frecvente in boala Alzheimer includ pierderi de memorie recente, confuzie, dificultati de orientare, probleme de limbaj, schimbari de comportament sau personalitate, scaderea judecatii si dificultati in activitatile zilnice. Raspunsul este informativ si nu inlocuieste consultul neurologic.";
        }

        if ((q.contains("tratament") || q.contains("medicament")) && (q.contains("alzheimer") || q.contains("dement"))) {
            return "Tratamentul pentru Alzheimer este stabilit de medic si poate include medicamente pentru simptome cognitive, masuri de siguranta, rutina zilnica, sprijin familial si controlul bolilor asociate. Nu incepe si nu opri un tratament fara neurolog sau medicul curant.";
        }

        if ((q.contains("diagnostic") || q.contains("depist") || q.contains("teste")) && (q.contains("alzheimer") || q.contains("dement"))) {
            return "Diagnosticul de Alzheimer se stabileste prin consult neurologic, discutie cu pacientul si familia, teste cognitive, analize si uneori imagistica precum RMN/CT. Chatbotul poate oferi informatii generale, dar diagnosticul trebuie pus de medic.";
        }

        if ((q.contains("preven") || q.contains("risc")) && (q.contains("alzheimer") || q.contains("dement"))) {
            return "Riscul de declin cognitiv poate fi influentat de varsta, istoricul familial, bolile cardiovasculare, somnul, activitatea fizica si stimularea cognitiva. Masurile utile includ controlul tensiunii si diabetului, miscare regulata, somn bun, alimentatie echilibrata si consult medical cand apar simptome.";
        }

        return null;
    }

    private List<String> search(String question) {
        double[] queryEmbedding = embeddingService.embed(question);

        if (chromaService.isEnabled()) {
            try {
                List<TextMatch> chromaMatches = chromaService.query(queryEmbedding, 20)
                        .stream()
                        .filter(text -> text != null && !text.isBlank())
                        .filter(text -> !isBoilerplate(text))
                        .distinct()
                        .map(text -> new TextMatch(text, lexicalScore(question, text)))
                        .sorted(Comparator.comparing(TextMatch::score).reversed())
                        .toList();

                List<String> strongMatches = chromaMatches.stream()
                        .filter(match -> match.score() >= MIN_CONTEXT_SCORE)
                        .limit(5)
                        .map(TextMatch::text)
                        .map(this::limitForPrompt)
                        .toList();

                if (!strongMatches.isEmpty()) {
                    return strongMatches;
                }

                List<String> fallbackMatches = chromaMatches.stream()
                        .limit(5)
                        .map(TextMatch::text)
                        .map(this::limitForPrompt)
                        .toList();

                if (!fallbackMatches.isEmpty()) {
                    return fallbackMatches;
                }
            } catch (Exception e) {
                System.err.println("Chroma search failed, falling back to local knowledge chunks: " + e.getMessage());
            }
        }

        return knowledgeChunkRepository.findByTopic(TOPIC)
                .stream()
                .map(chunk -> new ScoredChunk(
                        chunk,
                        embeddingService.similarity(queryEmbedding, embeddingService.fromJson(chunk.getEmbeddingJson()))
                                + lexicalScore(question, chunk.getContent())
                ))
                .sorted(Comparator.comparing(ScoredChunk::score).reversed())
                .filter(match -> !isBoilerplate(match.chunk().getContent()))
                .limit(5)
                .map(match -> limitForPrompt(match.chunk().getContent()))
                .toList();
    }

    private int lexicalScore(String question, String text) {
        String normalizedQuestion = normalize(question);
        String normalizedText = normalize(text);
        Set<String> questionWords = words(normalizedQuestion);
        int score = 0;

        for (String term : ALZHEIMER_TERMS) {
            if (normalizedText.contains(term)) {
                score += 2;
            }
        }

        for (String word : questionWords) {
            if (word.length() >= 4 && normalizedText.contains(word)) {
                score++;
            }
        }

        return score;
    }

    private boolean isBoilerplate(String text) {
        String normalized = normalize(text);
        return normalized.contains("copyright")
                || normalized.contains("all rights reserved")
                || normalized.contains("mcgraw hill")
                || normalized.contains("provided as is")
                || normalized.contains("terms of use")
                || normalized.contains("permission")
                || normalized.contains("isbn");
    }

    private Set<String> words(String text) {
        return new HashSet<>(Arrays.asList(text.split("[^a-z0-9]+")));
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }

        return java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    private String limitForPrompt(String text) {
        if (text == null || text.length() <= 1200) {
            return text;
        }

        return text.substring(0, 1200).trim();
    }

    private boolean isLowQualityAnswer(String reply) {
        String normalized = normalize(reply);
        return normalized.isBlank()
                || normalized.length() < 20
                || normalized.contains("nu am informatia")
                || normalized.contains("nu se afla in context")
                || normalized.contains("nu pot raspunde din context")
                || normalized.contains("nu stiu sigur din materialele incarcate")
                || normalized.contains("i don't know")
                || normalized.contains("i do not know");
    }

    private boolean isAllowedTopic(String username, String question) {
        String q = question == null ? "" : question.toLowerCase(Locale.ROOT);
        return isNeurologyTopic(q)
                || hasRecentAlzheimerContext(username, q);
    }

    private boolean isNeurologyTopic(String q) {
        return q.contains("alzheimer")
                || q.contains("dement")
                || q.contains("memorie")
                || q.contains("cognitiv")
                || q.contains("neurolog")
                || q.contains("creier")
                || q.contains("amnezie")
                || q.contains("orientare")
                || q.contains("comportament")
                || q.contains("durere de cap")
                || q.contains("ma doare capul")
                || q.contains("dureri de cap")
                || q.contains("migrena")
                || q.contains("amet")
                || q.contains("confuz")
                || q.contains("uit")
                || q.contains("vorbire")
                || q.contains("vedere")
                || q.contains("tremur")
                || q.contains("convuls")
                || q.contains("slabiciune")
                || q.contains("amorteala");
    }

    private boolean hasRecentAlzheimerContext(String username, String question) {
        if (question.contains("alzheimer") || question.contains("dement")) {
            return true;
        }

        if (username == null || username.isBlank()) {
            return false;
        }

        return chatMessageRepository.findTop6ByUsernameOrderByIdDesc(username)
                .stream()
                .map(ChatMessage::getMessage)
                .filter(message -> message != null)
                .map(this::normalize)
                .anyMatch(message -> message.contains("alzheimer") || message.contains("dement"));
    }

    private void saveMessage(String username, String role, String message) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUsername(username);
        chatMessage.setRole(role);
        chatMessage.setMessage(message);
        chatMessage.setTimestamp(LocalDate.now());
        chatMessageRepository.save(chatMessage);
    }

    private List<String> chunk(String text) {
        java.util.ArrayList<String> chunks = new java.util.ArrayList<>();
        int start = 0;

        while (start < text.length()) {
            int end = Math.min(start + CHUNK_SIZE, text.length());
            chunks.add(text.substring(start, end).trim());
            if (end == text.length()) {
                break;
            }
            start = Math.max(0, end - CHUNK_OVERLAP);
        }

        return chunks;
    }

    private String cleanText(String text) {
        if (text == null) {
            return "";
        }

        return text.replaceAll("\\s+", " ").trim();
    }

    private record ScoredChunk(KnowledgeChunk chunk, double score) {
    }

    private record TextMatch(String text, int score) {
    }
}
