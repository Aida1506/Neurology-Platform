import React, { useEffect, useState } from "react";
import axios from "axios";
import DoctorLayout from "./DoctorLayout";
import useDoctor from "./useDoctor";

function DoctorMriPage() {
    const { doctor, user } = useDoctor();
    const [images, setImages] = useState([]);
    const [comments, setComments] = useState({});

    const loadImages = () => {
        if (!doctor) return;

        axios
            .get(`http://localhost:8080/api/doctors/${doctor.id}/images/pending`)
            .then(res => setImages(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadImages();
    }, [doctor?.id]);

    const validateImage = async (id, approved) => {
        await axios.put(`http://localhost:8080/api/doctors/images/${id}/validate`, {
            approved,
            comment: comments[id] || ""
        });
        loadImages();
    };

    return (
        <DoctorLayout
            active="rmn"
            title="Validare RMN"
            subtitle="Vezi predictia AI si aproba sau respinge RMN-urile pacientilor."
            doctor={doctor}
            user={user}
        >
            <section className="bg-white rounded-2xl shadow p-6 border border-teal-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">RMN-uri in asteptare</h3>
                        <p className="text-sm text-gray-500 mt-1">Verifica predictia AI, adauga un comentariu si valideaza rezultatul.</p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{images.length} in asteptare</span>
                </div>
                <div className="space-y-4">
                    {images.length === 0 && (
                        <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-8 text-center text-gray-500">
                            Nu exista RMN-uri in asteptare.
                        </div>
                    )}
                    {images.map(img => (
                        <div key={img.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 items-center hover:border-teal-200 hover:bg-teal-50/30 transition">
                            <img src={`http://localhost:8080/api/patient/ai/image/${img.id}`} alt="RMN" className="w-40 h-40 object-cover rounded-2xl bg-gray-100" />
                            <div className="flex-1">
                                <p className="font-semibold">{img.patientUsername}</p>
                                <p className="text-sm text-gray-500">{img.filename}</p>
                                <pre className="mt-2 bg-gray-50 rounded-xl p-3 text-xs overflow-auto max-h-32 border border-gray-100">{img.resultJson}</pre>
                                <textarea
                                    value={comments[img.id] || ""}
                                    onChange={e => setComments({ ...comments, [img.id]: e.target.value })}
                                    placeholder="Comentariu medic"
                                    className="mt-3 w-full border border-teal-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => validateImage(img.id, true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-sm">Aproba</button>
                                <button onClick={() => validateImage(img.id, false)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-sm">Respinge</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </DoctorLayout>
    );
}

export default DoctorMriPage;
