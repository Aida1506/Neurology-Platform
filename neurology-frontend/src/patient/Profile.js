import React, { useState, useEffect } from "react";
import {
    FiHome,
    FiBarChart2,
    FiCalendar,
    FiMessageCircle,
    FiSettings
} from "react-icons/fi";

import axios from "axios";

import PacientProfileSymptoms from "./PatientProfileSymptoms";
import InfoTour from "../components/InfoTour";

function Profile() {

    const storedUser = localStorage.getItem("user");

    const user = storedUser
        ? JSON.parse(storedUser)
        : null;

    const [currentTime, setCurrentTime] = useState(new Date());

    const [selectedMonth, setSelectedMonth] =
        useState(currentTime.getMonth());

    const [selectedDay, setSelectedDay] =
        useState(currentTime.getDate());

    const [selectedFile, setSelectedFile] = useState(null);

    const [uploadMessage, setUploadMessage] = useState("");

    const [latestStatus, setLatestStatus] =
        useState("PENDING");

    const [loading, setLoading] = useState(false);

    const [uploadedImages, setUploadedImages] = useState([]);

    const [appointments, setAppointments] = useState([]);

    const upcomingAppointments = appointments
        .filter(appointment => new Date(appointment.dateTime).getTime() >= currentTime.getTime())
        .sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime));
    const tourSteps = [
        {
            title: "RMN-uri incarcate",
            description: "Primul cadran arata cate imagini RMN ai incarcat in aplicatie."
        },
        {
            title: "Simptome azi",
            description: "In cadranul de simptome poti scrie natural ce simti, iar aplicatia salveaza simptomul pentru medic."
        },
        {
            title: "Programari",
            description: "Cadranul de programari arata doar programarile viitoare si le coloreaza dupa cat de aproape sunt."
        },
        {
            title: "Analiza RMN",
            description: "In zona AI alegi medicul, incarci imaginea RMN si o trimiti pentru analiza. Rezultatul devine vizibil dupa validarea medicului."
        }
    ];

    const [doctors, setDoctors] = useState([]);

    const [selectedDoctor, setSelectedDoctor] =
        useState("");

    useEffect(() => {

        const interval =
            setInterval(() =>
                setCurrentTime(new Date()), 1000);

        return () => clearInterval(interval);

    }, []);

    useEffect(() => {

        axios
            .get("http://localhost:8080/api/doctors")
            .then(res => setDoctors(res.data))
            .catch(err => console.error(err));

    }, []);

    useEffect(() => {

        if (!user) return;

        axios.get(
            `http://localhost:8080/api/patient/ai/history/${user.username}`
        )
            .then(res => {

                setUploadedImages(res.data);
                if (res.data.length > 0) {
                    setLatestStatus(latestAnalysisStatus(res.data));
                }

            })
            .catch(err => console.error(err));

    }, [user]);

    useEffect(() => {

        if (!user) return;

        axios.get(
            `http://localhost:8080/api/patient/appointments/${user.username}`
        )
            .then(res => setAppointments(res.data))
            .catch(err => console.error(err));

    }, [user]);

    const handleUpload = async () => {

        if (!selectedFile) {

            setUploadMessage(
                "Te rog selecteaza o imagine."
            );

            return;
        }

        if (!selectedDoctor) {

            setUploadMessage(
                "Te rog selecteaza un medic."
            );

            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("file", selectedFile);

            formData.append(
                "doctorId",
                selectedDoctor
            );

            await axios.post(
                `http://localhost:8080/api/patient/ai/predict/${user.username}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setLatestStatus("PENDING");

            setUploadMessage(
                "Imaginea a fost incarcata cu succes. Asteapta validarea medicului."
            );

            const updated = await axios.get(
                `http://localhost:8080/api/patient/ai/history/${user.username}`
            );

            setUploadedImages(updated.data);
            setLatestStatus(latestAnalysisStatus(updated.data));

        } catch (err) {

            console.error(err);

            setUploadMessage(
                uploadErrorMessage(err)
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen flex font-sans bg-gradient-to-br from-teal-50 via-white to-blue-50">

            
            <aside className="w-64 h-screen sticky top-0 bg-gradient-to-b from-teal-400 to-blue-300 p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-lg">

                <h1 className="text-3xl font-bold text-white mb-8 text-center">
                    Cerebra
                </h1>

                <nav className="flex flex-col gap-4">

                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-teal-600 shadow text-white font-medium">
                        <FiHome size={20} />
                        Panou pacient
                    </button>

                    <button
                        onClick={() =>
                            window.location.href = "/evolution"
                        }
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 transition text-white font-medium"
                    >
                        <FiBarChart2 size={20} />
                        Evoluție
                    </button>

                    <button
                        onClick={() =>
                            window.location.href = "/calendar"
                        }
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 transition text-white font-medium"
                    >
                        <FiCalendar size={20} />
                        Calendar
                    </button>

                    <button
                        onClick={() =>
                            window.location.href = "/chatbot"
                        }
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 transition text-white font-medium"
                    >
                        <FiMessageCircle size={20} />
                        Chatbot
                    </button>

                    <button
                        onClick={() =>
                            window.location.href = "/settings"
                        }
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 transition text-white font-medium"
                    >
                        <FiSettings size={20} />
                        Setări
                    </button>

                </nav>
            </aside>

            
            <main className="flex-1 h-screen overflow-y-auto p-6 flex flex-col gap-6">
                
                <div className="bg-gradient-to-r from-teal-400 to-blue-300 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">
                            Panou pacient
                        </h3>
                    </div>
                    <InfoTour steps={tourSteps} />
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-teal-100">

                        <p className="text-sm text-gray-500 mb-2">
                            RMN-uri incarcate
                        </p>

                        <h3 className="text-5xl font-extrabold text-teal-600">
                            {uploadedImages.length}
                        </h3>

                    </div>

                    <PacientProfileSymptoms
                        username={user?.username}
                    />

                    <div className="bg-white rounded-2xl shadow p-6 border border-teal-100">

                        <div className="flex items-start justify-between gap-3 mb-4">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Programarile tale
                                </p>
                                <h3 className="text-lg font-bold text-gray-800">
                                    Calendar medical
                                </h3>
                            </div>

                            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                                {upcomingAppointments.length}
                            </span>

                        </div>

                        <div className="space-y-3 max-h-52 overflow-y-auto pr-1">

                            {upcomingAppointments.length === 0 && (
                                <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-4 text-center text-sm text-gray-500">
                                    Nu ai programari viitoare momentan.
                                </div>
                            )}

                            {upcomingAppointments
                                .slice(0, 4)
                                .map(appointment => {
                                    const urgency = appointmentUrgency(appointment.dateTime, currentTime);

                                    return (
                                        <div
                                            key={appointment.id}
                                            className={`rounded-xl border p-3 ${urgency.containerClass}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        Dr. {appointment.doctor?.fullName || "Medic"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatAppointmentDate(appointment.dateTime)}
                                                    </p>
                                                </div>
                                                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${urgency.badgeClass}`}>
                                                    {urgency.label}
                                                </span>
                                            </div>

                                            {appointment.reason && (
                                                <p className="mt-2 text-xs text-gray-600">
                                                    {appointment.reason}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}

                        </div>

                    </div>

                </div>

                
                <div className="grid grid-cols-1 gap-6">

                    
                    <div className="bg-gradient-to-r from-teal-400 to-blue-300 rounded-2xl shadow-lg p-6 text-white flex flex-col gap-5">

                        
                        <div className="bg-white/15 rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-4 border border-white/20">

                            <div className="flex flex-col gap-2">

                                <label className="text-sm font-semibold">
                                    Selecteaza medicul
                                </label>

                                <select
                                    value={selectedDoctor}
                                    onChange={(e) =>
                                        setSelectedDoctor(
                                            e.target.value
                                        )
                                    }
                                    className="bg-white text-black rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-200"
                                >

                                    <option value="">
                                        Selecteaza medic
                                    </option>

                                    {doctors.map(d => (

                                        <option
                                            key={d.id}
                                            value={d.id}
                                        >
                                            {d.fullName} - {d.specialization}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            <div className="flex flex-col gap-2">

                                <label className="text-sm font-semibold">
                                    Incarca imagine RMN / CT
                                </label>

                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setSelectedFile(
                                            e.target.files[0]
                                        )
                                    }
                                    className="bg-white text-black rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-200"
                                />

                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="bg-white text-teal-700 py-3 rounded-xl font-bold hover:bg-teal-50 hover:scale-105 transition disabled:opacity-50"
                            >
                                {loading
                                    ? "Se incarca..."
                                    : "Incarca pentru analiza AI"}
                            </button>

                            {uploadMessage && (

                                <div className="bg-white/25 rounded-xl p-3 border border-white/20">

                                    <p className="text-sm">
                                        {uploadMessage}
                                    </p>

                                </div>
                            )}

                            
                            <div className="bg-white/10 rounded-2xl p-4">

                                <p className="text-sm mb-2 font-semibold">
                                    Statusul ultimei analize
                                </p>

                                {latestStatus === "PENDING" && (
                                    <div className="bg-yellow-400/20 border border-yellow-300 rounded-xl px-4 py-3">

                                        <p className="font-semibold text-yellow-100">
                                            In asteptarea verificarii medicului
                                        </p>

                                    </div>
                                )}

                                {latestStatus === "APPROVED" && (
                                    <div className="bg-green-400/20 border border-green-300 rounded-xl px-4 py-3">

                                        <p className="font-semibold text-green-100">
                                            Aprobat de medic
                                        </p>

                                    </div>
                                )}

                                {latestStatus === "REJECTED" && (
                                    <div className="bg-red-400/20 border border-red-300 rounded-xl px-4 py-3">

                                        <p className="font-semibold text-red-100">
                                            Respins de medic
                                        </p>

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                    
                </div>

            </main>

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

function latestAnalysisStatus(images) {
    if (!images || images.length === 0) {
        return "PENDING";
    }

    const latest = [...images].sort((left, right) => {
        const leftTime = new Date(left.createdAt || 0).getTime();
        const rightTime = new Date(right.createdAt || 0).getTime();
        return rightTime - leftTime;
    })[0];

    return normalizeAnalysisStatus(latest);
}

function normalizeAnalysisStatus(image) {
    if (!image) {
        return "PENDING";
    }

    if (image.rejected) {
        return "REJECTED";
    }

    if (image.approved) {
        return "APPROVED";
    }

    const status = String(image.validationStatus || "").toUpperCase();

    if (status === "APPROVED" || status === "REJECTED") {
        return status;
    }

    return "PENDING";
}

function appointmentUrgency(dateTime, now) {
    const appointmentDate = new Date(dateTime);
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) {
        return {
            label: "foarte curand",
            containerClass: "border-red-200 bg-red-50",
            badgeClass: "bg-red-100 text-red-700"
        };
    }

    if (diffDays <= 7) {
        return {
            label: "apropiata",
            containerClass: "border-yellow-200 bg-yellow-50",
            badgeClass: "bg-yellow-100 text-yellow-700"
        };
    }

    return {
        label: "in viitor",
        containerClass: "border-green-200 bg-green-50",
        badgeClass: "bg-green-100 text-green-700"
    };
}

function formatAppointmentDate(dateTime) {
    if (!dateTime) {
        return "Data necunoscuta";
    }

    return new Date(dateTime).toLocaleString();
}

export default Profile;



