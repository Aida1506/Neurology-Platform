import React, { useState } from "react";
import axios from "axios";

function AiPage() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [gradcam, setGradcam] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        setFile(selected);

        if (selected) {
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handlePredict = async () => {
        if (!file) return alert("Selectează o imagine!");

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            const response = await axios.post(
                `http://localhost:8080/api/patient/ai/predict/${user.username}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log("RESPONSE:", response.data); // 🔥 debug

            setResult(response.data);

        } catch (err) {
            console.error("PREDICT ERROR:", err.response || err.message);
            alert("Predict failed");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 GradCAM
    const handleGradcam = async () => {
        if (!file) return alert("Selectează o imagine!");

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:8080/api/patient/ai/gradcam",
                formData
            );

            setGradcam("data:image/jpeg;base64," + response.data.image);

        } catch (err) {
            console.error(err);
            alert("GradCAM failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center p-10">

            <div className="flex flex-col items-center mb-8 gap-4">

                <h1 className="text-4xl font-bold text-purple-700">
                    🤖 AI Image Analysis
                </h1>

                <button
                    onClick={() => window.location.href = "/ai-gallery"}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow"
                >
                    🧠 Vezi istoric AI
                </button>

            </div>

            {/* MAIN CARD */}
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl flex flex-col gap-6">

                {/* Upload */}
                <div className="flex flex-col items-center gap-4">
                    <label className="cursor-pointer bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition">
                        Upload Image
                        <input type="file" hidden onChange={handleFileChange} />
                    </label>

                    {preview && (
                        <img
                            src={preview}
                            alt="preview"
                            className="max-h-64 rounded-xl shadow"
                        />
                    )}
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-6">
                    <button
                        onClick={handlePredict}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:scale-105 transition shadow"
                    >
                        🔍 Predict
                    </button>

                    <button
                        onClick={handleGradcam}
                        className="px-6 py-3 bg-green-500 text-white rounded-xl hover:scale-105 transition shadow"
                    >
                        🔥 GradCAM
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <p className="text-center text-gray-600 animate-pulse">
                        Se procesează imaginea...
                    </p>
                )}

                {/* Result */}
                {result && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <h2 className="font-bold mb-2 text-purple-600">
                            Rezultat AI
                        </h2>
                        <pre className="text-sm">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                {/* GradCAM */}
                {gradcam && (
                    <div className="flex flex-col items-center">
                        <h2 className="font-bold mb-2 text-green-600">
                            GradCAM
                        </h2>
                        <img
                            src={gradcam}
                            alt="gradcam"
                            className="rounded-xl shadow max-h-80"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default AiPage;