import React, { useState, useEffect } from "react";
import {
    FiHome,
    FiBarChart2,
    FiCalendar,
    FiSettings
} from "react-icons/fi";

import axios from "axios";

import PacientProfileSymptoms from "./PatientProfileSymptoms";

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

    // LIVE CLOCK
    useEffect(() => {

        const interval =
            setInterval(() =>
                setCurrentTime(new Date()), 1000);

        return () => clearInterval(interval);

    }, []);

    // LOAD IMAGES
    useEffect(() => {

        if (!user) return;

        axios.get(
            `http://localhost:8080/api/patient/ai/history/${user.username}`
        )
            .then(res => {

                setUploadedImages(res.data);

            })
            .catch(err => console.error(err));

    }, [user]);

    // UPLOAD HANDLER
    const handleUpload = async () => {

        if (!selectedFile) {

            setUploadMessage(
                "Please select an image."
            );

            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("file", selectedFile);

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
                "Image uploaded successfully. Awaiting doctor validation."
            );

            // refresh images
            const updated = await axios.get(
                `http://localhost:8080/api/patient/ai/history/${user.username}`
            );

            setUploadedImages(updated.data);

        } catch (err) {

            console.error(err);

            setUploadMessage(
                "Upload failed."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen flex font-sans bg-gray-100">

            {/* SIDEBAR */}
            <aside className="w-64 h-screen sticky top-0 bg-blue-300 p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-lg">

                <h1 className="text-3xl font-bold text-white mb-8 text-center">
                    Cerebra
                </h1>

                <nav className="flex flex-col gap-4">

                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-blue-500 text-white font-medium">
                        <FiHome size={20} />
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            window.location.href = "/evolution"
                        }
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 transition text-white font-medium"
                    >
                        <FiBarChart2 size={20} />
                        Evoluție
                    </button>

                    <button
                        onClick={() =>
                            window.location.href = "/calendar"
                        }
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 transition text-white font-medium"
                    >
                        <FiCalendar size={20} />
                        Calendar
                    </button>

                    <button className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-blue-400 transition text-white font-medium">
                        <FiSettings size={20} />
                        Setări
                    </button>

                </nav>
            </aside>

            {/* MAIN */}
            <main className="flex-1 h-screen overflow-y-auto p-6 flex flex-col gap-6">

                {/* HEADER */}
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
                            {user?.username}
                        </h2>

                        <p className="text-sm opacity-80">
                            {currentTime.toLocaleDateString()}
                            {" | "}
                            {currentTime.toLocaleTimeString()}
                        </p>

                    </div>

                </div>

                {/* TOP ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">

                        <p className="text-sm text-gray-500 mb-2">
                            Stare neurologică
                        </p>

                        <h3 className="text-4xl font-bold text-blue-600">
                            72%
                        </h3>

                        <p className="text-sm text-green-600 mt-2">
                            Stabilă
                        </p>

                    </div>

                    <PacientProfileSymptoms
                        username={user?.username}
                    />

                </div>

                {/* AI SECTION */}
                <div className="grid grid-cols-1 gap-6">

                    {/* AI CARD */}
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg p-6 text-white flex flex-col gap-5">

                        <div>

                            <h3 className="text-2xl font-bold mb-2">
                                AI Medical Imaging Analysis
                            </h3>

                            <p className="text-sm opacity-90 leading-relaxed">
                                Încarcă imagini RMN/CT pentru analiză neurologică asistată de AI.
                                Rezultatele sunt validate de medic înainte de afișare.
                            </p>

                        </div>

                        {/* upload */}
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm flex flex-col gap-4">

                            <div className="flex flex-col gap-2">

                                <label className="text-sm font-semibold">
                                    Upload MRI / CT Image
                                </label>

                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setSelectedFile(
                                            e.target.files[0]
                                        )
                                    }
                                    className="bg-white text-black rounded-xl p-2"
                                />

                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="bg-white text-purple-600 py-3 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50"
                            >
                                {loading
                                    ? "Uploading..."
                                    : "Upload for AI Analysis"}
                            </button>

                            {uploadMessage && (

                                <div className="bg-white/20 rounded-xl p-3">

                                    <p className="text-sm">
                                        {uploadMessage}
                                    </p>

                                </div>
                            )}

                            {/* STATUS */}
                            <div className="bg-white/10 rounded-2xl p-4">

                                <p className="text-sm mb-2 font-semibold">
                                    Latest Analysis Status
                                </p>

                                {latestStatus === "PENDING" && (
                                    <div className="bg-yellow-400/20 border border-yellow-300 rounded-xl px-4 py-3">

                                        <p className="font-semibold text-yellow-100">
                                            ⏳ Pending Doctor Review
                                        </p>

                                    </div>
                                )}

                                {latestStatus === "APPROVED" && (
                                    <div className="bg-green-400/20 border border-green-300 rounded-xl px-4 py-3">

                                        <p className="font-semibold text-green-100">
                                            ✅ Approved by Doctor
                                        </p>

                                    </div>
                                )}

                                {latestStatus === "REJECTED" && (
                                    <div className="bg-red-400/20 border border-red-300 rounded-xl px-4 py-3">

                                        <p className="font-semibold text-red-100">
                                            ❌ Rejected by Doctor
                                        </p>

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* UPLOADED IMAGES */}
                    <div className="bg-white rounded-2xl shadow p-6 flex flex-col">

                        <div className="flex items-center justify-between mb-4">

                            <h3 className="text-xl font-bold text-gray-800">
                                Uploaded MRI Analyses
                            </h3>

                            <span className="text-sm text-gray-500">
                                {uploadedImages.length} scans
                            </span>

                        </div>

                        <div className="h-[320px] overflow-y-auto pr-2 flex flex-col gap-4 snap-y snap-mandatory">

                            {uploadedImages.length === 0 && (

                                <div className="bg-gray-50 rounded-xl p-6 text-center">

                                    <p className="text-gray-500">
                                        No uploaded scans yet.
                                    </p>

                                </div>
                            )}

                            {uploadedImages.map(img => {

                                let status = "PENDING";

                                if (img.approved) status = "APPROVED";

                                if (img.rejected) status = "REJECTED";

                                return (

                                    <div
                                        key={img.id}
                                        className="border rounded-2xl p-4 flex gap-4 items-center min-h-[220px] snap-start bg-white"
                                    >

                                        {/* image */}
                                        <img
                                            src={`http://localhost:8080/api/patient/ai/image/${img.id}`}
                                            alt="MRI"
                                            className="w-40 h-40 object-cover rounded-2xl shadow"
                                        />

                                        {/* info */}
                                        <div className="flex-1">

                                            <p className="font-semibold text-gray-800">
                                                {img.filename}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(img.createdAt).toLocaleString()}
                                            </p>

                                            {/* status */}
                                            <div className="mt-3">

                                                {status === "PENDING" && (
                                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                        ⏳ Pending Review
                                                    </span>
                                                )}

                                                {status === "APPROVED" && (
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                        ✅ Approved
                                                    </span>
                                                )}

                                                {status === "REJECTED" && (
                                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                        ❌ Rejected
                                                    </span>
                                                )}

                                            </div>

                                            {/* doctor comment */}
                                            {img.doctorComment && (

                                                <div className="mt-3 bg-blue-50 rounded-xl p-2">

                                                    <p className="text-xs text-gray-500">
                                                        Doctor Comment
                                                    </p>

                                                    <p className="text-sm">
                                                        {img.doctorComment}
                                                    </p>

                                                </div>
                                            )}

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Profile;