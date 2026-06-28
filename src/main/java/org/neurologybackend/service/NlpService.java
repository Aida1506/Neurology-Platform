package org.neurologybackend.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;


@Service
public class NlpService {

    private static final Map<String, String> SYMPTOM_MAP = new HashMap<>();

    static {
        SYMPTOM_MAP.put("doare", "durere");
        SYMPTOM_MAP.put("durere", "durere");
        SYMPTOM_MAP.put("spate", "durere de spate");
        SYMPTOM_MAP.put("cap", "durere de cap");
        SYMPTOM_MAP.put("gat", "durere de gât");
        SYMPTOM_MAP.put("piept", "durere de piept");
        SYMPTOM_MAP.put("burta", "durere abdominală");
        SYMPTOM_MAP.put("abdomen", "durere abdominală");
        SYMPTOM_MAP.put("stomac", "durere de stomac");

        SYMPTOM_MAP.put("ameteal", "ameţeală");
        SYMPTOM_MAP.put("ameţeal", "ameţeală");
        SYMPTOM_MAP.put("vertij", "vertij");
        SYMPTOM_MAP.put("tremor", "tremor");
        SYMPTOM_MAP.put("paraliz", "paralizie");
        SYMPTOM_MAP.put("slab", "slăbiciune musculară");
        SYMPTOM_MAP.put("senzaţie", "tulburări senzitive");
        SYMPTOM_MAP.put("senzatia", "tulburări senzitive");
        SYMPTOM_MAP.put("mâncărime", "mâncărime");
        SYMPTOM_MAP.put("furnicaturi", "furnicături");

        SYMPTOM_MAP.put("cap rău", "cefalee");
        SYMPTOM_MAP.put("cefalee", "cefalee");
        SYMPTOM_MAP.put("migrenă", "migrenă");
        SYMPTOM_MAP.put("migrena", "migrenă");
        SYMPTOM_MAP.put("convulsii", "convulsii");
        SYMPTOM_MAP.put("sincop", "pierdere de cunoştinţă");
        SYMPTOM_MAP.put("pierdere cunoştinţă", "pierdere de cunoştinţă");

        SYMPTOM_MAP.put("uitat", "probleme de memorie");
        SYMPTOM_MAP.put("greu gândesc", "probleme cognitive");
        SYMPTOM_MAP.put("confuzie", "confuzie");
        SYMPTOM_MAP.put("disorientare", "disorientare");

        SYMPTOM_MAP.put("gâlcevire", "gâlcevire");
        SYMPTOM_MAP.put("cuvinte", "dificultate în vorbire");
        SYMPTOM_MAP.put("vorbire", "dificultate în vorbire");

        SYMPTOM_MAP.put("greu merg", "dificultate în mers");
        SYMPTOM_MAP.put("echilibru", "pierdere de echilibru");
        SYMPTOM_MAP.put("coordonare", "incoordolare");
    }

    
    public String parseSymptom(String naturalText) {
        if (naturalText == null || naturalText.isEmpty()) {
            return "simptom neclar";
        }

        String text = normalizeText(naturalText);
        String foundSymptom = null;
        int maxMatchLength = 0;

        for (String key : SYMPTOM_MAP.keySet()) {
            if (text.contains(key) && key.length() > maxMatchLength) {
                foundSymptom = SYMPTOM_MAP.get(key);
                maxMatchLength = key.length();
            }
        }

        return foundSymptom != null ? foundSymptom : cleanSympromText(text);
    }

    
    private String normalizeText(String text) {
        return text.toLowerCase()
                   .replaceAll("[^a-z0-9\\s]", "")
                   .trim();
    }

    
    private String cleanSympromText(String text) {
        String[] words = text.split("\\s+");
        StringBuilder sb = new StringBuilder();
        
        int wordCount = Math.min(3, words.length);
        for (int i = 0; i < wordCount; i++) {
            sb.append(words[i]);
            if (i < wordCount - 1) sb.append(" ");
        }
        
        return sb.toString().isEmpty() ? "simptom neclar" : sb.toString();
    }

    
    public Integer extractSeverity(String text) {
        String normalized = normalizeText(text);

        if (normalized.contains("grav") || normalized.contains("bardzo") || normalized.contains("mult")) {
            return 3;
        } else if (normalized.contains("moderat") || normalized.contains("mediu")) {
            return 2;
        } else {
            return 1;
        }
    }
}
