import React, { useEffect, useState } from "react";
import { FiCalendar, FiHome, FiImage, FiSettings, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function DoctorLayout({ active, title, subtitle, doctor, user, children }) {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const itemClass = (key) =>
        `flex items-center gap-3 py-3 px-4 rounded-xl text-white font-medium transition ${
            active === key ? "bg-teal-600 shadow" : "hover:bg-teal-500/70"
        }`;

    return (
        <div className="min-h-screen flex font-sans bg-gradient-to-br from-teal-50 via-white to-blue-50">
            <aside className="w-64 h-screen sticky top-0 bg-gradient-to-b from-teal-400 to-blue-300 p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Cerebra</h1>
                <nav className="flex flex-col gap-4">
                    <button onClick={() => navigate("/doctor")} className={itemClass("dashboard")}><FiHome /> Medic</button>
                    <button onClick={() => navigate("/doctor/programari")} className={itemClass("programari")}><FiCalendar /> Programari</button>
                    <button onClick={() => navigate("/doctor/pacienti")} className={itemClass("pacienti")}><FiUsers /> Pacienti</button>
                    <button onClick={() => navigate("/doctor/rmn")} className={itemClass("rmn")}><FiImage /> RMN</button>
                    <button onClick={() => navigate("/doctor/setari")} className={itemClass("setari")}><FiSettings /> Setari</button>
                </nav>
            </aside>

            <main className="flex-1 h-screen overflow-y-auto p-6 flex flex-col gap-6">
                <div className="bg-gradient-to-r from-teal-400 to-blue-300 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">{title}</h3>
                        <p className="text-sm opacity-90">{subtitle}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-semibold">{doctor ? doctor.fullName : user?.username}</h2>
                        <p className="text-sm opacity-80">{currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
                    </div>
                </div>

                {children}
            </main>
        </div>
    );
}

export default DoctorLayout;
