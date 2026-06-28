import React, { useState } from "react";
import { FiBarChart2, FiCalendar, FiHome, FiMessageCircle, FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import InfoTour from "../components/InfoTour";

function ChatbotPage() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const navigate = useNavigate();

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const tourSteps = [
        {
            title: "Scrie intrebarea",
            description: "Foloseste campul de jos pentru intrebari despre Alzheimer, simptome, diagnostic, tratament sau preventie."
        },
        {
            title: "Trimite mesajul",
            description: "Apasa Trimite sau Enter. Chatbotul cauta informatii in documentele incarcate si raspunde in romana."
        },
        {
            title: "Exemple rapide",
            description: "Cand conversatia este goala, poti apasa unul dintre exemplele propuse pentru a completa automat intrebarea."
        },
        {
            title: "Limita medicala",
            description: "Raspunsurile sunt informative. Pentru diagnostic sau tratament personalizat, pacientul trebuie sa discute cu medicul."
        }
    ];

    const sendQuestion = async () => {
        if (!question.trim()) return;
        if (!user?.username) {
            setMessages(prev => [
                ...prev,
                { role: "bot", text: "Trebuie sa fii autentificat ca pacient ca sa folosesti chatbotul." }
            ]);
            return;
        }

        const userMessage = { role: "user", text: question };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const res = await axios.post(
                `http://localhost:8080/api/patient/chat/${user.username}`,
                { message: question }
            );
            setMessages(prev => [...prev, { role: "bot", text: res.data.reply }]);
            setQuestion("");
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const serverMessage = typeof err.response?.data === "string"
                ? err.response.data
                : err.response?.data?.message;

            const message = status
                ? `Chatbotul nu a putut raspunde acum. Eroare backend: ${status}${serverMessage ? ` - ${serverMessage}` : ""}`
                : "Backendul nu raspunde pe localhost:8080. Porneste Spring Boot si incearca din nou.";

            setMessages(prev => [...prev, { role: "bot", text: message }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-gradient-to-br from-teal-50 via-white to-blue-50">
            <aside className="w-64 bg-gradient-to-b from-teal-400 to-blue-300 p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Cerebra</h1>
                <nav className="flex flex-col gap-4">
                    <button onClick={() => navigate("/profile")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiHome /> Panou pacient</button>
                    <button onClick={() => navigate("/evolution")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiBarChart2 /> Evolutie</button>
                    <button onClick={() => navigate("/calendar")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiCalendar /> Calendar</button>
                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-teal-600 shadow text-white"><FiMessageCircle /> Chatbot</button>
                    <button onClick={() => navigate("/settings")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiSettings /> Setari</button>
                </nav>
            </aside>

            <main className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
                <div className="bg-gradient-to-r from-teal-400 to-blue-300 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Chatbot Alzheimer</h2>
                    </div>
                    <InfoTour steps={tourSteps} />
                </div>

                <section className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 min-h-[520px] border border-teal-100">
                    <div className="flex items-start justify-between gap-4 border-b border-teal-50 pb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Asistent medical educational</h3>
                        </div>
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">Alzheimer</span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-gray-50/60 p-4">
                        {messages.length === 0 && (
                            <div className="text-gray-500 text-center py-10">
                                <p className="font-medium text-gray-700">Pune o intrebare despre Alzheimer.</p>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {[
                                        "Care sunt simptomele timpurii?",
                                        "Cum se pune diagnosticul?",
                                        "Ce tratamente exista?"
                                    ].map(example => (
                                        <button
                                            key={example}
                                            onClick={() => setQuestion(example)}
                                            className="rounded-full border border-teal-100 bg-white px-3 py-1 text-sm text-teal-700 hover:bg-teal-50"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={`p-4 rounded-2xl max-w-3xl whitespace-pre-line shadow-sm ${message.role === "user" ? "bg-teal-500 ml-auto text-white" : "bg-white text-gray-700 border border-gray-100"}`}>
                                {message.text}
                            </div>
                        ))}
                        {loading && <div className="text-gray-500">Se cauta in documente...</div>}
                    </div>

                    <div className="flex gap-3">
                        <input
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") sendQuestion();
                            }}
                            placeholder="Ex: Care sunt simptomele timpurii in Alzheimer?"
                            className="border border-teal-100 rounded-xl p-3 flex-1 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
                        />
                        <button onClick={sendQuestion} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-xl font-semibold shadow">Trimite</button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default ChatbotPage;

