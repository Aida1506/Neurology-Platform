import React, { useEffect, useState } from "react";
import {
    FiHome,
    FiBarChart2,
    FiCalendar,
    FiMessageCircle,
    FiSettings
} from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
import InfoTour from "../components/InfoTour";

function EvolutionPage() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [data, setData] = useState([]);
    const [images, setImages] = useState([]);
    const navigate = useNavigate();
    const tourSteps = [
        {
            title: "Graficul evolutiei",
            description: "Graficul foloseste doar RMN-urile aprobate de medic si arata schimbarea stadiului AI in timp."
        },
        {
            title: "Punctele din grafic",
            description: "Fiecare punct reprezinta un RMN validat. Axa verticala arata stadiul, iar axa orizontala arata data analizei."
        },
        {
            title: "Istoricul RMN",
            description: "Cardurile de jos arata imaginile incarcate, statusul lor si rezultatul AI doar dupa aprobarea medicului."
        },
        {
            title: "Statusuri",
            description: "In asteptare inseamna ca medicul inca nu a validat, Aprobat inseamna validat, iar Respins inseamna invalidat de medic."
        }
    ];

    useEffect(() => {
        if (!user?.username) return;

        axios.get(`http://localhost:8080/api/patient/ai/history/${user.username}`)
            .then(res => {
                setImages(res.data);

                const mapped = res.data
                    .filter(item => item.approved)
                    .map(item => {
                        if (!item.createdAt || !item.resultJson) return null;

                        const result = parseResult(item.resultJson);
                        const label = result?.class || item.disease || "";
                        const time = new Date(item.createdAt.replace(" ", "T"));

                        if (isNaN(time.getTime())) return null;

                        return {
                            time: time.getTime(),
                            date: time.toLocaleDateString(),
                            stage: resultStage(label),
                            label
                        };
                    })
                    .filter(Boolean)
                    .sort((a, b) => a.time - b.time);

                setData(mapped);
            })
            .catch(err => console.error(err));
    }, [user?.username]);

    return (
        <div className="min-h-screen flex font-sans bg-gradient-to-br from-teal-50 via-white to-blue-50">
            <aside className="w-64 h-screen sticky top-0 bg-gradient-to-b from-teal-400 to-blue-300 p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">
                    Cerebra
                </h1>

                <nav className="flex flex-col gap-4">
                    <button onClick={() => navigate("/profile")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white">
                        <FiHome />
                        Panou pacient
                    </button>
                    <button onClick={() => navigate("/evolution")} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-teal-600 shadow text-white">
                        <FiBarChart2 />
                        Evolutie
                    </button>
                    <button onClick={() => navigate("/calendar")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white">
                        <FiCalendar />
                        Calendar
                    </button>
                    <button onClick={() => navigate("/chatbot")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white">
                        <FiMessageCircle />
                        Chatbot
                    </button>
                    <button onClick={() => navigate("/settings")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white">
                        <FiSettings />
                        Setari
                    </button>
                </nav>
            </aside>

            <main className="flex-1 h-screen overflow-y-auto p-6 flex flex-col gap-6">
                <div className="bg-gradient-to-r from-teal-400 to-blue-300 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">
                            Evolutia bolii din RMN-uri
                        </h2>
                    </div>
                    <InfoTour steps={tourSteps} />
                </div>

                <div className="bg-white rounded-2xl shadow p-6 border border-teal-100">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Evolutie stadiu boala (AI)
                            </h3>
                        </div>
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                            {data.length} puncte
                        </span>
                    </div>

                    {data.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-10 text-center text-gray-500">
                            Nu exista inca suficiente RMN-uri aprobate pentru grafic.
                        </div>
                    ) : (
                        <div className="rounded-xl bg-gray-50/70 p-4">
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis
                                        dataKey="time"
                                        type="number"
                                        domain={["dataMin", "dataMax"]}
                                        tickFormatter={(t) => new Date(t).toLocaleDateString()}
                                    />
                                    <YAxis
                                        domain={[0, 3]}
                                        ticks={[0, 1, 2, 3]}
                                        tickFormatter={stageName}
                                    />
                                    <Tooltip
                                        labelFormatter={(label) => `Data: ${new Date(label).toLocaleString()}`}
                                        formatter={(value) => stageName(value)}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="stage"
                                        stroke="#14b8a6"
                                        strokeWidth={3}
                                        dot={{ r: 6, fill: "#14b8a6", strokeWidth: 2 }}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow p-6 border border-teal-100">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Istoric RMN-uri
                            </h3>
                        </div>
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                            {images.length} imagini
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {images.length === 0 && (
                            <div className="md:col-span-3 rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-8 text-center text-gray-500">
                                Nu ai RMN-uri incarcate momentan.
                            </div>
                        )}
                        {images.map(img => {
                            const result = parseResult(img.resultJson);
                            const confidence = result?.confidence ?? img.confidence;

                            return (
                                <div key={img.id} className="border border-gray-100 rounded-xl p-3 flex flex-col hover:border-teal-200 hover:shadow-sm transition">
                                    <img
                                        src={`http://localhost:8080/api/patient/ai/image/${img.id}`}
                                        alt="RMN"
                                        className="rounded-xl mb-3 h-52 object-cover bg-gray-100"
                                    />

                                    <div className="mb-3">
                                        {img.approved && (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                Aprobat
                                            </span>
                                        )}
                                        {!img.approved && !img.rejected && (
                                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                In asteptarea aprobarii
                                            </span>
                                        )}
                                        {img.rejected && (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                Respins
                                            </span>
                                        )}
                                    </div>

                                    {img.approved ? (
                                        <>
                                            <p className="text-sm font-semibold">
                                                {diseaseLabel(result?.class || img.disease)}
                                            </p>
                                            {confidence != null && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Incredere: {(confidence * 100).toFixed(2)}%
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">
                                            Rezultatul AI va fi disponibil dupa validarea medicului.
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

        </div>
    );
}

function parseResult(resultJson) {
    if (!resultJson) return null;

    try {
        return JSON.parse(resultJson);
    } catch (err) {
        return null;
    }
}

function resultStage(result) {
    if (!result) return 0;

    if (result.includes("Non")) return 0;
    if (result.includes("VeryMild")) return 1;
    if (result.includes("Mild")) return 2;
    if (result.includes("Moderate")) return 3;

    return 0;
}

function stageName(value) {
    switch (value) {
        case 0:
            return "Normal";
        case 1:
            return "Foarte usor";
        case 2:
            return "Usor";
        case 3:
            return "Moderat";
        default:
            return "";
    }
}

function diseaseLabel(value) {
    if (!value) {
        return "Necunoscut";
    }

    if (value.includes("Non")) {
        return "Fara dementa";
    }

    if (value.includes("VeryMild")) {
        return "Dementa foarte usoara";
    }

    if (value.includes("Mild")) {
        return "Dementa usoara";
    }

    if (value.includes("Moderate")) {
        return "Dementa moderata";
    }

    return value;
}

export default EvolutionPage;
