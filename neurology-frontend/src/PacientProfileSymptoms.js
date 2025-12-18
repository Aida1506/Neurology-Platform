import React, { useState, useEffect } from "react";
import axios from "axios";

function SymptomsPanel({ username }) {
    const [symptoms, setSymptoms] = useState([]);
    const [newSymptom, setNewSymptom] = useState("");
    const [severity, setSeverity] = useState(5);

    useEffect(() => {
        const fetchSymptoms = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8080/api/dashboard/symptoms/${username}`
                );
                setSymptoms(res.data);
            } catch (err) {
                console.error("Eroare la preluarea simptomelor:", err);
            }
        };
        fetchSymptoms();
    }, [username]);

    const addSymptom = async () => {
        if (!newSymptom) return;

        try {
            const res = await axios.post(
                "http://localhost:8080/api/dashboard/symptoms/add",
                {
                    username,
                    symptom: newSymptom,
                    severity
                }
            );

            // Adaugă simptomul imediat în listă
            setSymptoms(prev => [
                { id: Date.now(), symptom: newSymptom, severity, date: new Date() },
                ...prev
            ]);

            setNewSymptom("");
            setSeverity(5);
        } catch (err) {
            console.error("Eroare la adăugare simptom:", err);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500 mb-3">Simptome azi</p>

            {/* Formular pentru introducere simptom */}
            <div className="flex gap-2 mb-3 items-center">
                <input
                    type="text"
                    placeholder="Simptom"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    className="flex-1 border rounded-xl px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-16 border rounded-xl px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                    onClick={addSymptom}
                    className="flex-shrink-0 bg-blue-500 text-white px-3 py-1 rounded-xl text-sm hover:bg-blue-600 transition"
                >
                    Adaugă
                </button>
            </div>

            {/* Lista de simptome */}
            <ul className="text-gray-700 space-y-1 max-h-48 overflow-y-auto text-sm">
                {symptoms.length === 0 && <li>Nu sunt simptome înregistrate.</li>}
                {symptoms.map((s) => (
                    <li key={s.id} className="flex justify-between">
                        <span>{s.symptom}</span>
                        <span className="text-gray-500">{s.severity}/10</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SymptomsPanel;
