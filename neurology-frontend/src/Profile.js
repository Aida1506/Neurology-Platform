import React, { useState, useEffect } from "react";
import { FiHome, FiBarChart2, FiCalendar, FiSettings } from "react-icons/fi";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import PacientProfileSymptoms from "./PacientProfileSymptoms";

// Dummy data pentru evolutie / grafice
const evolutieData = [
    { zi: "Lun", durere: 5, somn: 6 },
    { zi: "Mar", durere: 3, somn: 7 },
    { zi: "Mie", durere: 7, somn: 5 },
    { zi: "Joi", durere: 4, somn: 8 },
    { zi: "Vin", durere: 6, somn: 6 },
];

function Profile() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(currentTime.getMonth());
    const [selectedDay, setSelectedDay] = useState(currentTime.getDate());

    // Actualizează ora în timp real
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Zile pentru selectare
    const daysInMonth = new Date(currentTime.getFullYear(), selectedMonth + 1, 0).getDate();
    const months = [
        "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
        "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
    ];

    return (
        <div className="min-h-screen flex font-sans bg-gray-100">

            {/* Sidebar */}
            <aside className="w-64 bg-blue-300 p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Cerebra</h1>
                <nav className="flex flex-col gap-4">
                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 transition text-white font-medium">
                        <FiHome size={20} /> Dashboard
                    </button>
                    <button
                        onClick={() => window.location.href = "/evolution"}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 transition text-white font-medium"
                    >
                        <FiBarChart2 size={20} /> Evoluție
                    </button>
                    <button
                        onClick={() => window.location.href = ("/calendar")}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 transition text-white font-medium"
                    >
                        <FiCalendar size={20} /> Calendar
                    </button>
                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 transition text-white font-medium">
                        <FiSettings size={20} /> Setări
                    </button>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6 flex flex-col gap-6 overflow-auto">

                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">

                    <div>
                        <h3 className="text-xl font-bold">
                            Bun venit în Cerebra
                        </h3>
                        <p className="text-sm opacity-90">
                            Monitorizează evoluția și starea neurologică
                        </p>
                    </div>

                    <div className="text-right">
                        <h2 className="text-lg font-semibold">
                            {user.username}
                        </h2>
                        <p className="text-sm opacity-80">
                            {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
                        </p>
                    </div>

                </div>

                {/* 3 panels row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-2">Stare neurologică</p>
                        <h3 className="text-4xl font-bold text-blue-600">72%</h3>
                        <p className="text-sm text-green-600 mt-2">Stabilă</p>
                    </div>

                    <PacientProfileSymptoms username={user.username} />

                </div>

                {/* 2 panels row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* AI CARD */}
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">

                        <div>
                            <h3 className="text-lg font-bold mb-2">
                                Analiză AI imagistică
                            </h3>
                        </div>

                        <button
                            onClick={() => window.location.href = "/ai"}
                            className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold hover:scale-105 transition"
                        >
                            Deschide AI →
                        </button>
                    </div>


                        <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Recomandări AI</h3>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>Crește durata somnului cu 1 oră</li>
                            <li>Monitorizează migrenele timp de 3 zile</li>
                            <li>Hidratare constantă recomandată</li>
                        </ul>
                    </div>

                </div>

            </main>

            {/* Right sidebar */}
            <aside className="w-80 p-6 flex flex-col gap-6">
                {/* My Profile */}
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mb-4" />
                    <h3 className="text-xl font-bold">{user.username}</h3>
                    <p className="text-gray-500">{user.role || "Pacient"}</p>
                    <button className="mt-3 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition">
                        Editează profil
                    </button>
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold mb-2">Calendar evenimente</h3>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="border rounded-xl px-3 py-2 w-full"
                    >
                        {months.map((m, idx) => (
                            <option key={idx} value={idx}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(Number(e.target.value))}
                        className="border rounded-xl px-3 py-2 w-full"
                    >
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <div className="mt-2 h-40 overflow-auto border rounded-xl p-2">
                        <p className="text-gray-500 text-sm">Evenimente pentru {selectedDay} {months[selectedMonth]}:</p>
                        <ul className="mt-2 text-gray-700">
                            <li>08:00 - Consultație</li>
                            <li>10:30 - Terapie</li>
                            <li>14:00 - Medicatie</li>
                        </ul>
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default Profile;
