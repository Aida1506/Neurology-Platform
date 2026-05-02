import React, { useEffect, useState } from "react";
import axios from "axios";

function AiGallery() {
    const [images, setImages] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/dashboard/ai/history")
            .then(res => setImages(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-10">

            <h1 className="text-3xl font-bold mb-8 text-purple-600">
                🧠 Istoric Analize AI
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {images.map(img => (
                    <div key={img.id} className="bg-white rounded-2xl shadow p-4">

                        {/* imagine */}
                        <img
                            src={`http://localhost:8080/api/dashboard/ai/image/${img.id}`}
                            alt="ai"
                            className="rounded-xl mb-4"
                        />

                        {/* info */}
                        <p className="text-sm font-semibold">{img.filename}</p>

                        <p className="text-xs text-gray-400">
                            {new Date(img.createdAt).toLocaleString()}
                        </p>

                        {/* rezultat */}
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto">
                            {img.resultJson}
                        </pre>

                    </div>
                ))}

            </div>
        </div>
    );
}

export default AiGallery;