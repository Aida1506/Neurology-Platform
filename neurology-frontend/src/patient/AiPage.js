import React, { useEffect, useState } from "react";
import axios from "axios";
import InfoTour from "../components/InfoTour";

function AiPage() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [doctorId, setDoctorId] = useState("");
    const tourSteps = [
        {
            title: "Alege medicul",
            description: "Selecteaza medicul care va valida rezultatul analizei RMN."
        },
        {
            title: "Incarca imaginea",
            description: "Apasa Incarca imagine si alege o imagine RMN valida. Pozele obisnuite sunt respinse."
        },
        {
            title: "Trimite pentru analiza",
            description: "Apasa Analizeaza pentru a trimite imaginea catre serviciul AI. Rezultatul ramane in asteptarea validarii medicului."
        },
        {
            title: "Vezi istoricul",
            description: "Butonul Vezi istoric AI deschide lista analizelor incarcate si statusul lor."
        }
    ];

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/doctors")
            .then(res => setDoctors(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        setFile(selected);
        setResult(null);

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        if (selected) {
            setPreview(URL.createObjectURL(selected));
        } else {
            setPreview(null);
        }
    };

    const handlePredict = async () => {
        if (!file) return alert("Selecteaza o imagine!");
        if (!doctorId) return alert("Selecteaza medicul.");
        if (!user?.username) return alert("Utilizator invalid.");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("doctorId", doctorId);

        try {
            setLoading(true);

            const response = await axios.post(
                `http://localhost:8080/api/patient/ai/predict/${user.username}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setResult(response.data);
        } catch (err) {
            console.error("PREDICT ERROR:", err.response || err.message);
            alert(uploadErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex flex-col items-center p-10">
            <div className="flex flex-col items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold text-teal-600">
                        Analiza imaginii AI
                    </h1>
                    <InfoTour steps={tourSteps} />
                </div>

                <button
                    onClick={() => window.location.href = "/ai-gallery"}
                    className="px-6 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition shadow"
                >
                    Vezi istoric AI
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl flex flex-col gap-6 border border-teal-100">
                <div className="flex flex-col items-center gap-4">
                    <select
                        value={doctorId}
                        onChange={(e) => setDoctorId(e.target.value)}
                        className="border rounded-xl p-3 w-full max-w-sm"
                    >
                        <option value="">Selecteaza medic</option>
                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.fullName} - {d.specialization}
                            </option>
                        ))}
                    </select>

                    <label className="cursor-pointer bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-600 transition">
                        Incarca imagine
                        <input type="file" hidden onChange={handleFileChange} />
                    </label>

                    {preview && (
                        <img
                            src={preview}
                            alt="Previzualizare"
                            className="max-h-64 rounded-xl shadow"
                        />
                    )}
                </div>

                <div className="flex justify-center gap-6">
                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 hover:scale-105 transition shadow disabled:opacity-60"
                    >
                        Analizeaza
                    </button>
                </div>

                {loading && (
                    <p className="text-center text-gray-600 animate-pulse">
                        Se proceseaza imaginea...
                    </p>
                )}

                {result && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <h2 className="font-bold mb-2 text-teal-600">
                            Rezultat AI
                        </h2>
                        <pre className="text-sm">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

function uploadErrorMessage(err) {
    const data = err?.response?.data;
    const fallback = "Imaginea selectata nu este valida pentru analiza RMN. Te rog incarca o imagine RMN clara.";

    if (typeof data === "string" && data.trim()) {
        return patientImageErrorMessage(data, fallback);
    }

    if (data?.message) {
        return patientImageErrorMessage(data.message, fallback);
    }

    if (data?.detail) {
        return patientImageErrorMessage(data.detail, fallback);
    }

    return fallback;
}

function patientImageErrorMessage(message, fallback) {
    const normalized = String(message || "").toLowerCase();

    if (
        normalized.includes("imagine invalida")
        || normalized.includes("fisier invalid")
        || normalized.includes("ai service failed")
        || normalized.includes("bad request")
    ) {
        return fallback;
    }

    return message;
}

export default AiPage;
