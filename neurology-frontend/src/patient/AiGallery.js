import React, { useEffect, useState } from "react";
import axios from "axios";
import InfoTour from "../components/InfoTour";

function AiGallery() {

    const [images, setImages] = useState([]);

    const storedUser = localStorage.getItem("user");

    const user = storedUser
        ? JSON.parse(storedUser)
        : null;
    const tourSteps = [
        {
            title: "Lista RMN-urilor",
            description: "Aici vezi imaginile RMN incarcate si statusul fiecarei analize."
        },
        {
            title: "Statusul analizei",
            description: "In asteptare inseamna ca medicul nu a validat inca. Aprobat afiseaza rezultatul, iar Respins marcheaza o analiza respinsa."
        },
        {
            title: "Rezultat si incredere",
            description: "Pentru RMN-urile aprobate vezi clasa prezisa de AI si procentul de incredere."
        },
        {
            title: "Comentariul medicului",
            description: "Daca medicul a adaugat un comentariu la validare, acesta apare in cardul imaginii."
        }
    ];

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

        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-10">
            <div className="mb-8 flex items-center gap-3">
                <h1 className="text-4xl font-bold text-teal-600">
                    Istoric imagistica medicala
                </h1>
                <InfoTour steps={tourSteps} />
            </div>

            {images.length === 0 && (

                <div className="bg-white rounded-2xl shadow p-8 text-center border border-teal-100">

                    <p className="text-gray-500 text-lg">
                        Nu exista inca analize aprobate.
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
                            className="bg-white rounded-2xl shadow p-4 border border-teal-100"
                        >

                            
                            <img
                                src={`http://localhost:8080/api/patient/ai/image/${img.id}`}
                                alt="RMN"
                                className="rounded-xl mb-4 h-56 w-full object-cover"
                            />

                            
                            <p className="text-sm font-semibold mb-1">
                                {img.filename}
                            </p>

                            
                            <p className="text-xs text-gray-400 mb-3">
                                {new Date(img.createdAt).toLocaleString()}
                            </p>

                            
                            <div className="mb-3">

                                {img.approved && (
                                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                                        APROBAT
                                    </span>
                                )}

                                {img.rejected && (
                                    <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">
                                        RESPINS
                                    </span>
                                )}

                                {!img.approved && !img.rejected && (
                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">
                                        IN ASTEPTAREA VERIFICARII
                                    </span>
                                )}

                            </div>

                            
                            {img.approved && result && (

                                <div className="bg-gray-50 rounded-xl p-3 text-sm">

                                    <p className="font-semibold">
                                        Afectiune:
                                        <span className="text-teal-600 ml-2">
                                            {diseaseLabel(result.class)}
                                        </span>
                                    </p>

                                    <p className="mt-2">
                                        Incredere:
                                        <span className="ml-2 font-semibold">
                                            {(result.confidence * 100).toFixed(2)}%
                                        </span>
                                    </p>

                                </div>
                            )}

                            
                            {!img.approved && !img.rejected && (

                                <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-700">

                                    In asteptarea validarii medicului.

                                </div>
                            )}

                            
                            {img.doctorComment && (

                                <div className="mt-3 bg-teal-50 rounded-xl p-3">

                                    <p className="text-xs text-gray-500 mb-1">
                                        Comentariul medicului
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

function diseaseLabel(value) {
    if (!value) {
        return "Necunoscut";
    }

    if (value.includes("Non")) {
        return "Fara dementa";
    }

    if (value.includes("VeryMild")) {
        return "Dementa foarte usoara";
    }

    if (value.includes("Mild")) {
        return "Dementa usoara";
    }

    if (value.includes("Moderate")) {
        return "Dementa moderata";
    }

    return value;
}

