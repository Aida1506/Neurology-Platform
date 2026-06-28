import React, { useEffect, useState } from "react";
import axios from "axios";
import DoctorLayout from "./DoctorLayout";
import useDoctor from "./useDoctor";

function DoctorPatientsPage() {
    const { doctor, user } = useDoctor();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [symptoms, setSymptoms] = useState([]);

    useEffect(() => {
        if (!doctor) return;

        axios
            .get(`http://localhost:8080/api/doctors/${doctor.id}/patients`)
            .then(res => {
                setPatients(res.data);
                if (!selectedPatient && res.data.length > 0) {
                    setSelectedPatient(res.data[0]);
                }
            })
            .catch(err => console.error(err));
    }, [doctor?.id]);

    useEffect(() => {
        if (!doctor || !selectedPatient) return;

        axios
            .get(`http://localhost:8080/api/doctors/${doctor.id}/patient/${selectedPatient}/symptoms`)
            .then(res => setSymptoms(res.data))
            .catch(err => console.error(err));
    }, [doctor?.id, selectedPatient]);

    return (
        <DoctorLayout
            active="pacienti"
            title="Pacientii mei"
            subtitle="Pacientii asignati si simptomele introduse de ei."
            doctor={doctor}
            user={user}
        >
            <section className="bg-white rounded-2xl shadow p-6 border border-teal-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Pacienti</h3>
                        <p className="text-sm text-gray-500 mt-1">Selecteaza un pacient pentru a vedea simptomele introduse.</p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{patients.length} pacienti</span>
                </div>
                {patients.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-8 text-center text-gray-500">Nu exista pacienti asignati.</div>
                ) : (
                    <>
                        <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="border border-teal-100 rounded-xl p-3 mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                            {patients.map(patient => <option key={patient} value={patient}>{patient}</option>)}
                        </select>

                        <div className="space-y-2">
                            {symptoms.length === 0 && <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-6 text-center text-gray-500">Pacientul nu are simptome inregistrate.</div>}
                            {symptoms.map(symptom => (
                                <div key={symptom.id} className="border border-gray-100 rounded-xl p-4 hover:border-teal-200 hover:bg-teal-50/30 transition">
                                    <p className="font-semibold">{symptom.symptom} <span className="text-gray-500 text-sm">({symptom.severity}/3)</span></p>
                                    <p className="text-sm text-gray-500">{symptom.date} - {symptom.originalText}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </DoctorLayout>
    );
}

export default DoctorPatientsPage;
