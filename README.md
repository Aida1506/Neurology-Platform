# Cerebra

Aplicatia este un sistem web pentru monitorizarea pacientilor cu probleme neurologice, cu doua roluri principale: pacient si medic. Proiectul include un backend Spring Boot, un frontend React, un serviciu separat pentru analiza imaginilor RMN si un chatbot educational bazat pe RAG.

## Tehnologii folosite

- Java 21, Spring Boot, Spring Security, JPA
- MySQL
- React
- Python, FastAPI, PyTorch
- ChromaDB
- Ollama cu modelul `llama3.2:1b`

## Structura proiectului

```text
Licenta/
  backend/
    src/
    pom.xml
    neurology-frontend/
      src/
      public/
      package.json
  ai-service/
    main.py
    model.py
    alzheimer_cnn.pth
    requirements.txt
```

Backend-ul si frontend-ul sunt in folderul `backend`, iar serviciul pentru modelul CNN este separat, in `ai-service`.

## Cerinte inainte de pornire

Pe calculator trebuie sa fie instalate:

- Java 21
- Maven
- Node.js si npm
- Python
- MySQL
- Ollama
- ChromaDB

## Configurare baza de date

In MySQL trebuie creata baza de date:

```sql
CREATE DATABASE neurology;
```

Conexiunea este configurata in:

```text
src/main/resources/application.properties
```

Exemplu:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/neurology
spring.datasource.username=root
spring.datasource.password=PAROLA_TA
spring.jpa.hibernate.ddl-auto=update
```

Parola trebuie schimbata in functie de configuratia locala. Tabelele sunt create automat de Hibernate la pornirea backend-ului.

## Pornire ChromaDB

Chroma este folosit pentru partea de chatbot, mai exact pentru cautarea semantica in documentele incarcate.

Instalare:

```bash
pip install chromadb
```

Pornire:

```bash
chroma run --host 127.0.0.1 --port 8002 --path ./chroma-data
```

In `application.properties`, backend-ul asteapta Chroma la:

```properties
chroma.url=http://127.0.0.1:8002
```

## Pornire Ollama

Chatbotul foloseste un model LLM local prin Ollama.

Modelul folosit in proiect:

```bash
ollama pull llama3.2:1b
```

Pornire Ollama:

```bash
ollama serve
```

Configurarea din backend:

```properties
llm.enabled=true
llm.base-url=http://127.0.0.1:11434/api/chat
llm.model=llama3.2:1b
```

## Pornire serviciu AI pentru RMN

Serviciul Python se afla in folderul `ai-service`. Acesta incarca modelul `alzheimer_cnn.pth` si expune endpoint-ul `/predict`.

```bash
cd C:\Users\Aida\OneDrive\Desktop\Licenta\ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Modelul `alzheimer_cnn.pth` trebuie sa ramana in acelasi folder cu `main.py` si `model.py`.

Backend-ul trimite imaginile catre:

```properties
ai.python-url=http://127.0.0.1:8000
```

## Pornire backend

Din folderul `backend`:

```bash
cd C:\Users\Aida\OneDrive\Desktop\Licenta\backend
mvn spring-boot:run
```

Daca Maven nu este disponibil direct in terminal, se poate folosi Maven-ul inclus in IntelliJ:

```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.3\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run
```

Backend-ul ruleaza pe:

```text
http://localhost:8080
```

## Pornire frontend

Din folderul `neurology-frontend`:

```bash
cd C:\Users\Aida\OneDrive\Desktop\Licenta\backend\neurology-frontend
npm install
npm start
```

Aplicatia React ruleaza pe:

```text
http://localhost:3000
```

## Ordinea in care pornesc serviciile

Cel mai simplu este sa fie pornite in ordinea asta:

1. MySQL
2. ChromaDB
3. Ollama
4. serviciul Python pentru RMN
5. backend-ul Spring Boot
6. frontend-ul React

## Functionalitati

### Pacient

- creare cont si autentificare
- adaugare simptome in limbaj natural
- incarcare imagini RMN/CT pentru analiza AI
- alegerea medicului care valideaza analiza
- vizualizare status pentru ultima analiza
- istoric RMN
- grafic de evolutie pe baza analizelor aprobate
- creare programari
- chatbot educational despre Alzheimer
- schimbare parola si resetare prin email

### Medic

- vizualizare pacienti asignati
- vizualizare simptome introduse de pacienti
- confirmare sau respingere programari
- validare rezultate RMN generate de modelul AI
- adaugare comentariu la analiza RMN
- gestionare intervale disponibile pentru programari

## Prelucrarea simptomelor

Pacientul poate introduce simptome in limbaj natural, de exemplu:

```text
ma doare capul foarte tare azi
```

Backend-ul foloseste un serviciu NLP simplu, bazat pe reguli si cuvinte-cheie, pentru a extrage:

- simptomul standardizat
- severitatea aproximativa
- textul original introdus de pacient

Medicul vede atat simptomul procesat, cat si formularea originala.

## Chatbot RAG

Chatbotul foloseste documente incarcate in aplicatie. Acestea sunt impartite in fragmente, transformate in embeddings si salvate in ChromaDB. Cand pacientul pune o intrebare, backend-ul cauta fragmente relevante si le trimite catre modelul LLM rulat local prin Ollama.

Pe scurt:

1. pacientul trimite intrebarea
2. backend-ul cauta informatii relevante in Chroma
3. contextul gasit este trimis catre Ollama
4. modelul genereaza raspunsul in romana
5. raspunsul este afisat in chatbot

## Analiza imaginilor RMN

Partea de imagistica foloseste un model CNN implementat in PyTorch. Pacientul incarca o imagine RMN, iar backend-ul o trimite catre serviciul FastAPI. Rezultatul nu este afisat direct pacientului, ci ramane in asteptare pana cand medicul il valideaza.

Flux:

1. pacientul incarca imaginea
2. serviciul AI face predictia
3. rezultatul este salvat cu status `PENDING`
4. medicul verifica rezultatul
5. medicul aproba sau respinge analiza
6. pacientul vede rezultatul doar dupa aprobare

## Build

Frontend:

```bash
cd neurology-frontend
npm run build
```

Backend:

```bash
mvn clean package
```

Fisierul `.jar` rezultat se afla in folderul `target`.

## Fisiere care nu trebuie urcate

Urmatoarele fisiere/foldere sunt generate local si nu trebuie puse in repository:

```text
node_modules/
build/
target/
*.log
.venv/
```

## Probleme posibile

Daca frontend-ul nu porneste, se ruleaza din nou:

```bash
npm install
npm start
```

Daca backend-ul nu porneste, trebuie verificate:

- conexiunea la MySQL
- existenta bazei de date `neurology`
- parola din `application.properties`

Daca chatbotul nu raspunde, trebuie verificate:

- ChromaDB pe portul `8002`
- Ollama pe portul `11434`
- modelul `llama3.2:1b`

Daca analiza RMN nu merge, trebuie verificate:

- serviciul FastAPI pe portul `8000`
- existenta fisierului `alzheimer_cnn.pth`
- instalarea dependintelor din `requirements.txt`

## Nota

Pentru publicarea proiectului, parolele si datele sensibile din `application.properties` ar trebui inlocuite cu valori exemplu sau mutate in variabile de mediu.
