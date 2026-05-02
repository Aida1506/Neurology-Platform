import React, { useState } from "react";
import axios from "axios";

function AiPage() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [gradcam, setGradcam] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🔹 Predict
    const handlePredict = async () => {
        console.log("PREDICT CLICKED");
        console.log("FILE:", file);
        if (!file) {
            alert("Selectează o imagine!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:8080/api/dashboard/ai/predict",
                formData
            );

            setResult(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 GradCAM
    const handleGradcam = async () => {
        if (!file) {
            alert("Selectează o imagine!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:8080/api/dashboard/ai/gradcam",
                formData
            );

            // 🔥 backend returnează base64
            const imageBase64 = response.data.image;

            setGradcam("data:image/jpeg;base64," + imageBase64);

        } catch (err) {
            console.error("GRADCAM ERROR:", err);
            alert("GradCAM failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">

            <h1 className="text-3xl font-bold mb-6 text-purple-600">
                Analiză AI imagistică
            </h1>

            {/* Upload */}
            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-4"
            />

            {/* Buttons */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={handlePredict}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                >
                    Predict
                </button>

                <button
                    onClick={handleGradcam}
                    className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                >
                    GradCAM
                </button>
            </div>

            {/* Loading */}
            {loading && <p className="text-gray-600">Se procesează...</p>}

            {/* Result */}
            {result && (
                <div className="bg-white p-6 rounded-xl shadow mb-6">
                    <h2 className="font-bold mb-2">Rezultat AI:</h2>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}

            {/* GradCAM */}
            {gradcam && (
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="font-bold mb-2">GradCAM:</h2>
                    <img src={gradcam} alt="gradcam" className="max-w-md rounded-lg" />
                </div>
            )}

        </div>
    );
}

export default AiPage;