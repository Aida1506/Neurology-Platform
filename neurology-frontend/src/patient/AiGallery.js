import React, { useEffect, useState } from "react";
import axios from "axios";

function AiGallery() {

    const [images, setImages] = useState([]);

    const storedUser = localStorage.getItem("user");

    const user = storedUser
        ? JSON.parse(storedUser)
        : null;

    useEffect(() => {

        if (!user) return;

        axios.get(
            `http://localhost:8080/api/patient/ai/history/${user.username}`
        )
            .then(res => {

                setImages(res.data);

            })
            .catch(err => console.error(err));

    }, []);

    return (

        <div className="min-h-screen bg-gray-100 p-10">

            <h1 className="text-4xl font-bold mb-8 text-purple-600">
                🧠 Medical Imaging History
            </h1>

            {images.length === 0 && (

                <div className="bg-white rounded-2xl shadow p-8 text-center">

                    <p className="text-gray-500 text-lg">
                        No approved analyses yet.
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                        Uploaded scans will appear after doctor validation.
                    </p>

                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {images.map(img => {

                    let result = null;

                    try {

                        result = JSON.parse(img.resultJson);

                    } catch (e) {

                        console.error(e);
                    }

                    return (

                        <div
                            key={img.id}
                            className="bg-white rounded-2xl shadow p-4"
                        >

                            {/* image */}
                            <img
                                src={`http://localhost:8080/api/patient/ai/image/${img.id}`}
                                alt="MRI"
                                className="rounded-xl mb-4 h-56 w-full object-cover"
                            />

                            {/* filename */}
                            <p className="text-sm font-semibold mb-1">
                                {img.filename}
                            </p>

                            {/* date */}
                            <p className="text-xs text-gray-400 mb-3">
                                {new Date(img.createdAt).toLocaleString()}
                            </p>

                            {/* status */}
                            <div className="mb-3">

                                {img.approved && (
                                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                                        APPROVED
                                    </span>
                                )}

                                {img.rejected && (
                                    <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">
                                        REJECTED
                                    </span>
                                )}

                                {!img.approved && !img.rejected && (
                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">
                                        PENDING REVIEW
                                    </span>
                                )}

                            </div>

                            {/* result */}
                            {img.approved && result && (

                                <div className="bg-gray-50 rounded-xl p-3 text-sm">

                                    <p className="font-semibold">
                                        Disease:
                                        <span className="text-purple-600 ml-2">
                                            {result.class}
                                        </span>
                                    </p>

                                    <p className="mt-2">
                                        Confidence:
                                        <span className="ml-2 font-semibold">
                                            {(result.confidence * 100).toFixed(2)}%
                                        </span>
                                    </p>

                                </div>
                            )}

                            {/* pending */}
                            {!img.approved && !img.rejected && (

                                <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-700">

                                    Awaiting doctor validation.

                                </div>
                            )}

                            {/* doctor comment */}
                            {img.doctorComment && (

                                <div className="mt-3 bg-blue-50 rounded-xl p-3">

                                    <p className="text-xs text-gray-500 mb-1">
                                        Doctor Comment
                                    </p>

                                    <p className="text-sm">
                                        {img.doctorComment}
                                    </p>

                                </div>
                            )}

                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AiGallery;