import React, { useEffect, useState } from "react";
import { FiBarChart2, FiCalendar, FiHome, FiMessageCircle, FiSettings } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InfoTour from "../components/InfoTour";

function CalendarPage() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [form, setForm] = useState({
        doctorId: "",
        availabilityId: "",
        reason: ""
    });

    const navigate = useNavigate();
    const tourSteps = [
        {
            title: "Alege medicul",
            description: "Selecteaza medicul la care vrei sa faci programarea. Lista contine medicii disponibili in aplicatie."
        },
        {
            title: "Alege slotul",
            description: "Dupa ce alegi medicul, aplicatia incarca sloturile viitoare publicate de acesta. Fiecare slot contine deja data si ora."
        },
        {
            title: "Trimite programarea",
            description: "Completeaza motivul consultatiei si apasa Creeaza programare. Cererea apare apoi in lista de programari."
        },
        {
            title: "Urmareste statusul",
            description: "In lista de jos vezi programarile tale si statusul lor."
        }
    ];

    useEffect(() => {
        if (!user) return;

        axios
            .get(`http://localhost:8080/api/patient/appointments/${user.username}`)
            .then(res => setAppointments(res.data))
            .catch(err => console.error(err));
    }, [user]);

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/doctors")
            .then(res => setDoctors(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!form.doctorId) {
            setAvailableSlots([]);
            return;
        }

        axios
            .get(`http://localhost:8080/api/doctors/${form.doctorId}/availability`)
            .then(res => {
                const now = new Date();
                const slots = res.data
                    .filter(slot => slot.status === "AVAILABLE")
                    .filter(slot => new Date(`${slot.date}T${slot.startTime}`).getTime() >= now.getTime())
                    .sort((left, right) => new Date(`${left.date}T${left.startTime}`) - new Date(`${right.date}T${right.startTime}`));

                setAvailableSlots(slots);
            })
            .catch(err => console.error(err));
    }, [form.doctorId]);

    const handleCreate = async () => {
        if (!form.doctorId || !form.availabilityId) {
            alert("Alege medicul si un slot disponibil.");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/patient/appointments", {
                patientUsername: user.username,
                doctorId: form.doctorId,
                availabilityId: form.availabilityId,
                reason: form.reason
            });

            const refreshed = await axios.get(`http://localhost:8080/api/patient/appointments/${user.username}`);
            setAppointments(refreshed.data);
            setForm({ doctorId: form.doctorId, availabilityId: "", reason: "" });
            setAvailableSlots(prev => prev.filter(slot => String(slot.id) !== String(form.availabilityId)));
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Eroare la creare programare");
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-gradient-to-br from-teal-50 via-white to-blue-50">
            <aside className="w-64 bg-gradient-to-b from-teal-400 to-blue-300 p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Cerebra</h1>
                <nav className="flex flex-col gap-4">
                    <button onClick={() => navigate("/profile")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiHome /> Panou pacient</button>
                    <button onClick={() => navigate("/evolution")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiBarChart2 /> Evolutie</button>
                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-teal-600 shadow text-white"><FiCalendar /> Calendar</button>
                    <button onClick={() => navigate("/chatbot")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiMessageCircle /> Chatbot</button>
                    <button onClick={() => navigate("/settings")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiSettings /> Setari</button>
                </nav>
            </aside>

            <main className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
                <div className="bg-gradient-to-r from-teal-400 to-blue-300 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Calendar programari</h2>
                    </div>
                    <InfoTour steps={tourSteps} />
                </div>

                <section className="bg-white rounded-2xl shadow p-6 flex flex-col gap-5 border border-teal-100">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Creeaza programare</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            Medic
                            <select
                                value={form.doctorId}
                                onChange={(e) => setForm({ ...form, doctorId: e.target.value, availabilityId: "" })}
                                className="border border-teal-100 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
                            >
                                <option value="">Selecteaza medic</option>
                                {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} - {d.specialization}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            Slot disponibil
                            <select
                                value={form.availabilityId}
                                onChange={(e) => setForm({ ...form, availabilityId: e.target.value })}
                                className="border border-teal-100 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
                            >
                                <option value="">Selecteaza un slot disponibil</option>
                                {availableSlots.map(slot => (
                                    <option key={slot.id} value={slot.id}>
                                        {new Date(`${slot.date}T${slot.startTime}`).toLocaleDateString()} | {slot.startTime} - {slot.endTime}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            Motiv consultatie
                            <input
                                placeholder="Ex: control neurologic"
                                value={form.reason}
                                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                className="border border-teal-100 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
                            />
                        </label>
                    </div>

                    <button onClick={handleCreate} className="bg-teal-500 text-white py-3 px-5 rounded-xl hover:bg-teal-600 font-semibold shadow w-fit">Creeaza programare</button>
                </section>

                <section className="bg-white rounded-2xl shadow p-6 border border-teal-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Programarile tale</h3>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold">{appointments.length} total</span>
                    </div>
                    <div className="space-y-3">
                        {appointments.length === 0 && (
                            <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-6 text-center text-gray-500">
                                Nu ai programari create momentan.
                            </div>
                        )}
                        {appointments.map(a => (
                            <div key={a.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center hover:border-teal-200 hover:bg-teal-50/30 transition">
                                <div>
                                    <p className="font-semibold">Dr. {a.doctor?.fullName}</p>
                                    <p className="text-sm text-gray-500">{new Date(a.dateTime).toLocaleString()}</p>
                                    <p className="text-sm">{a.reason}</p>
                                </div>
                                <span className="text-xs px-3 py-1 bg-teal-100 text-teal-700 rounded-full">{a.status}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default CalendarPage;
