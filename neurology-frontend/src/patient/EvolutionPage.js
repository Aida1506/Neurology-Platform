import React, { useState, useEffect } from "react";
import { FiHome, FiBarChart2, FiCalendar, FiSettings } from "react-icons/fi";
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

function EvolutionPage() {

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const [data, setData] = useState([]);
    const [images, setImages] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/patient/ai/history/${user.username}`)
            .then(res => {

                setImages(res.data);

                const mapped = res.data
                    .map((item) => {
                        if (!item.createdAt) return null;

                        const result = JSON.parse(item.resultJson);

                        // 🔥 FIX pentru LocalDateTime (Spring)
                        const time = new Date(item.createdAt.replace(" ", "T"));

                        if (isNaN(time.getTime())) return null;

                        let stage = 0;

                        if (result.class.includes("Non")) stage = 0;
                        else if (result.class.includes("VeryMild")) stage = 1;
                        else if (result.class.includes("Mild")) stage = 2;
                        else if (result.class.includes("Moderate")) stage = 3;

                        return {
                            time: time.getTime(), // 🔥 numeric
                            date: time.toLocaleDateString(),
                            stage: stage,
                            label: result.class
                        };
                    })
                    .filter(Boolean)
                    .sort((a, b) => a.time - b.time);

                setData(mapped);
            });
    }, []);

    return (
        <div className="min-h-screen flex font-sans bg-gray-100">

            {/* Sidebar */}
            <aside className="w-64 bg-blue-300 p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Cerebra</h1>

                <nav className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 text-white"
                    >
                        <FiHome /> Dashboard
                    </button>

                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-blue-500 text-white">
                        <FiBarChart2 /> Evoluție
                    </button>

                    <button
                        onClick={() => window.location.href = ("/calendar")}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 transition text-white font-medium"
                    >
                        <FiCalendar size={20} /> Calendar
                    </button>

                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 text-white">
                        <FiSettings /> Setări
                    </button>
                </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 p-6 flex flex-col gap-6 overflow-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">
                            📊 Evoluția bolii din RMN-uri
                        </h2>
                    </div>

                </div>

                {/* GRAPH */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Evoluție stadiu boală (AI)
                    </h3>

                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data}>

                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                            <XAxis
                                dataKey="time"
                                type="number"
                                domain={["dataMin", "dataMax"]}
                                tickFormatter={(t) =>
                                    new Date(t).toLocaleDateString()
                                }
                            />

                            <YAxis
                                domain={[0, 3]}
                                ticks={[0, 1, 2, 3]}
                                tickFormatter={(v) => {
                                    switch (v) {
                                        case 0: return "Normal";
                                        case 1: return "Very Mild";
                                        case 2: return "Mild";
                                        case 3: return "Moderate";
                                        default: return "";
                                    }
                                }}
                            />

                            <Tooltip
                                labelFormatter={(label) =>
                                    `Data: ${new Date(label).toLocaleString()}`
                                }
                                formatter={(value) => {
                                    switch (value) {
                                        case 0: return "NonDemented";
                                        case 1: return "VeryMild";
                                        case 2: return "Mild";
                                        case 3: return "Moderate";
                                        default: return "";
                                    }
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="stage"
                                stroke="#ef4444"
                                strokeWidth={3}
                                dot={{ r: 6 }}
                                isAnimationActive={false}
                            />

                        </LineChart>
                    </ResponsiveContainer>

                </div>

                {/* IMAGES */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Istoric RMN-uri
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {images.map(img => {
                            const result = JSON.parse(img.resultJson);

                            return (
                                <div key={img.id} className="border rounded-xl p-3">

                                    <img
                                        src={`http://localhost:8080/api/patient/ai/image/${img.id}`}
                                        className="rounded mb-2"
                                    />

                                    <p className="text-sm font-semibold">
                                        {result.class}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Confidence: {(result.confidence * 100).toFixed(2)}%
                                    </p>

                                </div>
                            );
                        })}
                    </div>
                </div>

            </main>

            <aside className="w-80 p-6 flex flex-col gap-6">
                <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="font-bold mb-2">🧠 Interpretare</h3>
                    <p className="text-sm text-gray-600">
                        Evoluția este bazată pe clasificarea AI în stadii clinice.
                    </p>
                </div>
            </aside>
        </div>
    );
}

export default EvolutionPage;