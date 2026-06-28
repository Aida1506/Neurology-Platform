import React, { useEffect, useState } from "react";
import axios from "axios";

function SymptomsPanel({ username }) {
    const [symptoms, setSymptoms] = useState([]);
    const [naturalText, setNaturalText] = useState("");

    useEffect(() => {
        const fetchSymptoms = async () => {
            if (!username) return;

            try {
                const res = await axios.get(`http://localhost:8080/api/patient/symptoms/${username}`);
                setSymptoms(res.data);
            } catch (err) {
                console.error("Eroare la preluarea simptomelor:", err);
            }
        };

        fetchSymptoms();
    }, [username]);

    const addSymptom = async () => {
        if (!naturalText.trim()) return;

        try {
            const res = await axios.post(
                `http://localhost:8080/api/patient/symptoms/add-natural/${username}`,
                { text: naturalText }
            );

            setSymptoms(prev => [res.data, ...prev]);
            setNaturalText("");
        } catch (err) {
            console.error("Eroare la adaugare simptom:", err);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow p-4 border border-teal-100">
            <p className="text-sm text-gray-500 mb-3">Simptome azi</p>

            <div className="flex gap-2 mb-3 items-center">
                <input
                    type="text"
                    placeholder="Ex: ma doare capul azi"
                    value={naturalText}
                    onChange={(e) => setNaturalText(e.target.value)}
                    className="flex-1 border rounded-xl px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
                <button
                    onClick={addSymptom}
                    className="flex-shrink-0 bg-teal-500 text-white px-3 py-1 rounded-xl text-sm hover:bg-teal-600 transition"
                >
                    Adauga
                </button>
            </div>

            <ul className="text-gray-700 space-y-1 max-h-48 overflow-y-auto text-sm">
                {symptoms.length === 0 && <li>Nu sunt simptome inregistrate.</li>}
                {symptoms.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3">
                        <span>{s.symptom}</span>
                        <span className="text-gray-500">{s.severity}/3</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SymptomsPanel;
