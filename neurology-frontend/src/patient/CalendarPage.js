import React, { useState, useEffect } from "react";
import { FiHome, FiBarChart2, FiCalendar, FiSettings } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CalendarPage() {

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const [appointments, setAppointments] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [form, setForm] = useState({
        doctorName: "",
        dateTime: "",
        reason: ""
    });

    const navigate = useNavigate();

    // 🔹 live clock
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // 🔹 load appointments
    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/patient/appointments/${user.username}`)
            .then(res => setAppointments(res.data));
    }, []);

    // 🔹 create appointment
    const handleCreate = async () => {
        if (!form.doctorName || !form.dateTime) {
            alert("Completează câmpurile!");
            return;
        }

        await axios.post("http://localhost:8080/api/patient/appointments", {
            ...form,
            patientUsername: user.username
        });

        alert("Programare creată!");
        window.location.reload();
    };

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

                    <button
                        onClick={() => navigate("/evolution")}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 text-white"
                    >
                        <FiBarChart2 /> Evoluție
                    </button>

                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-blue-500 text-white">
                        <FiCalendar /> Calendar
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
                            📅 Calendar programări
                        </h2>
                        <p className="text-sm opacity-80">
                            Gestionează programările tale medicale
                        </p>
                    </div>

                    <div className="text-right">
                        <p>{user?.username}</p>
                        <p className="text-sm">
                            {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                {/* CREATE APPOINTMENT */}
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">

                    <h3 className="text-lg font-semibold">➕ Creează programare</h3>

                    <input
                        placeholder="Doctor"
                        onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                        className="border rounded-xl p-2"
                    />

                    <input
                        type="datetime-local"
                        onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                        className="border rounded-xl p-2"
                    />

                    <input
                        placeholder="Motiv"
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        className="border rounded-xl p-2"
                    />

                    <button
                        onClick={handleCreate}
                        className="bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600"
                    >
                        Creează
                    </button>

                </div>

                {/* APPOINTMENTS LIST */}
                <div className="bg-white rounded-2xl shadow p-6">

                    <h3 className="text-lg font-semibold mb-4">
                        Programările tale
                    </h3>

                    <div className="space-y-3">
                        {appointments.map(a => (
                            <div
                                key={a.id}
                                className="border rounded-xl p-4 flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-semibold">{a.doctorName}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(a.dateTime).toLocaleString()}
                                    </p>
                                    <p className="text-sm">{a.reason}</p>
                                </div>

                                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                                    {a.status}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>

            </main>

            {/* Right panel */}
            <aside className="w-80 p-6 flex flex-col gap-6">

                <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="font-bold mb-2">📌 Info</h3>
                    <p className="text-sm text-gray-600">
                        Aici poți gestiona toate programările tale.
                        Recomandat: verifică periodic calendarul.
                    </p>
                </div>

            </aside>
        </div>
    );
}

export default CalendarPage;