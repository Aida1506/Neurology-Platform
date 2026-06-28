import React, { useEffect, useState } from "react";
import axios from "axios";
import DoctorLayout from "./DoctorLayout";
import useDoctor from "./useDoctor";

function DoctorAppointmentsPage() {
    const { doctor, user } = useDoctor();
    const [appointments, setAppointments] = useState([]);

    const loadAppointments = () => {
        if (!doctor) return;

        axios
            .get(`http://localhost:8080/api/doctors/${doctor.id}/appointments`)
            .then(res => setAppointments(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadAppointments();
    }, [doctor?.id]);

    const confirmAppointment = async (id) => {
        await axios.put(`http://localhost:8080/api/doctors/appointments/${id}/confirm`);
        loadAppointments();
    };

    const rejectAppointment = async (id) => {
        await axios.put(`http://localhost:8080/api/doctors/appointments/${id}/reject`);
        loadAppointments();
    };

    return (
        <DoctorLayout
            active="programari"
            title="Programari pacienti"
            subtitle="Confirma sau respinge cererile de programare."
            doctor={doctor}
            user={user}
        >
            <section className="bg-white rounded-2xl shadow p-6 border border-teal-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Programari</h3>
                        <p className="text-sm text-gray-500 mt-1">Gestioneaza solicitarile pacientilor tai.</p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{appointments.length} total</span>
                </div>
                <div className="space-y-4">
                    {appointments.length === 0 && (
                        <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-8 text-center text-gray-500">
                            Nu exista programari.
                        </div>
                    )}
                    {appointments.map(a => (
                        <div key={a.id} className="border border-gray-100 rounded-2xl p-4 flex justify-between items-center hover:border-teal-200 hover:bg-teal-50/30 transition">
                            <div>
                                <p className="font-semibold">{a.patientUsername}</p>
                                <p className="text-sm text-gray-500">{new Date(a.dateTime).toLocaleString()}</p>
                                <p className="text-sm">{a.reason}</p>
                            </div>
                            <div className="flex gap-2">
                                {a.status === "PENDING" ? (
                                    <>
                                        <button onClick={() => confirmAppointment(a.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-sm">Confirma</button>
                                        <button onClick={() => rejectAppointment(a.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-sm">Respinge</button>
                                    </>
                                ) : (
                                    <span className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm">{appointmentStatusLabel(a.status)}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </DoctorLayout>
    );
}

export default DoctorAppointmentsPage;

function appointmentStatusLabel(status) {
    switch (status) {
        case "PENDING":
            return "In asteptare";
        case "CONFIRMED":
            return "Confirmata";
        case "REJECTED":
            return "Respinsa";
        default:
            return status || "Necunoscut";
    }
}
