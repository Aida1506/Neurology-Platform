import React, { useEffect, useState } from "react";
import { FiCalendar, FiImage, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DoctorLayout from "./DoctorLayout";
import useDoctor from "./useDoctor";

function DoctorDashboard() {
    const { doctor, user } = useDoctor();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [images, setImages] = useState([]);
    const [neurologicalStatus, setNeurologicalStatus] = useState("");
    const [availabilityForm, setAvailabilityForm] = useState({
        date: "",
        startTime: "",
        endTime: ""
    });
    const [availabilities, setAvailabilities] = useState([]);

    useEffect(() => {
        if (!doctor) return;

        axios.get(`http://localhost:8080/api/doctors/${doctor.id}/appointments`).then(res => setAppointments(res.data)).catch(console.error);
        axios.get(`http://localhost:8080/api/doctors/${doctor.id}/patients`).then(res => setPatients(res.data)).catch(console.error);
        axios.get(`http://localhost:8080/api/doctors/${doctor.id}/images/pending`).then(res => setImages(res.data)).catch(console.error);
        axios.get(`http://localhost:8080/api/doctors/${doctor.id}/availability`).then(res => setAvailabilities(res.data)).catch(console.error);
        axios.get(`http://localhost:8080/api/doctors/${doctor.id}/neurological-status`).then(res => setNeurologicalStatus(res.data.status || "")).catch(console.error);
    }, [doctor?.id]);

    const addAvailability = async () => {
        if (!availabilityForm.date || !availabilityForm.startTime || !availabilityForm.endTime) {
            alert("Completeaza data si intervalul orar.");
            return;
        }

        await axios.post(`http://localhost:8080/api/doctors/${doctor.id}/availability`, availabilityForm);
        setAvailabilityForm({ date: "", startTime: "", endTime: "" });

        const refreshed = await axios.get(`http://localhost:8080/api/doctors/${doctor.id}/availability`);
        setAvailabilities(refreshed.data);
    };

    return (
        <DoctorLayout
            active="dashboard"
            title="Panou medic"
            subtitle="Privire rapida peste programari, pacienti si RMN-uri."
            doctor={doctor}
            user={user}
        >
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => navigate("/doctor/programari")} className="bg-white rounded-2xl shadow p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition border border-teal-100">
                    <FiCalendar className="text-teal-500 mb-3" size={28} />
                    <p className="text-sm text-gray-500">Programari</p>
                    <p className="text-4xl font-extrabold text-gray-800">{appointments.length}</p>
                </button>
                <button onClick={() => navigate("/doctor/pacienti")} className="bg-white rounded-2xl shadow p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition border border-teal-100">
                    <FiUsers className="text-blue-400 mb-3" size={28} />
                    <p className="text-sm text-gray-500">Pacienti</p>
                    <p className="text-4xl font-extrabold text-gray-800">{patients.length}</p>
                </button>
                <button onClick={() => navigate("/doctor/rmn")} className="bg-white rounded-2xl shadow p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition border border-teal-100">
                    <FiImage className="text-green-500 mb-3" size={28} />
                    <p className="text-sm text-gray-500">RMN-uri in asteptare</p>
                    <p className="text-4xl font-extrabold text-gray-800">{images.length}</p>
                </button>
            </section>

            <section className="bg-white rounded-2xl shadow p-6 border border-teal-100">
                <h3 className="text-xl font-bold mb-1 text-gray-800">Stare neurologica</h3>
                <p className="text-sm text-gray-500 mb-4">Nota interna vizibila in zona medicului.</p>
                <textarea
                    value={neurologicalStatus}
                    onChange={(e) => setNeurologicalStatus(e.target.value)}
                    className="w-full min-h-28 border border-teal-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="Stare vizibila doar pentru medic"
                />
                <button
                    onClick={() => axios.put(`http://localhost:8080/api/doctors/${doctor.id}/neurological-status`, { status: neurologicalStatus })}
                    className="mt-3 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl"
                >
                    Salveaza
                </button>
            </section>

            <section className="bg-white rounded-2xl shadow p-6 border border-teal-100">
                <h3 className="text-xl font-bold mb-1 text-gray-800">Disponibilitate calendar</h3>
                <p className="text-sm text-gray-500 mb-4">Publica intervalele in care pacientii pot solicita programari.</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="date" value={availabilityForm.date} onChange={e => setAvailabilityForm({ ...availabilityForm, date: e.target.value })} className="border border-teal-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                    <input type="time" value={availabilityForm.startTime} onChange={e => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })} className="border border-teal-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                    <input type="time" value={availabilityForm.endTime} onChange={e => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })} className="border border-teal-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                    <button onClick={addAvailability} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold shadow">Adauga slot</button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availabilities.map(slot => (
                        <div key={slot.id} className="border border-gray-100 rounded-xl p-3 text-sm hover:border-teal-200 hover:bg-teal-50/30 transition">
                            <p className="font-semibold">{slot.date} {slot.startTime} - {slot.endTime}</p>
                            <p className="text-gray-500">{availabilityStatusLabel(slot.status)}</p>
                        </div>
                    ))}
                </div>
            </section>
        </DoctorLayout>
    );
}

export default DoctorDashboard;

function availabilityStatusLabel(status) {
    switch (status) {
        case "AVAILABLE":
            return "Disponibil";
        case "BOOKED":
            return "Rezervat";
        default:
            return status || "Necunoscut";
    }
}
