import React, { useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const token = searchParams.get("token") || "";

    const resetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage("Parolele nu coincid.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:8080/api/settings/reset-password", { token, newPassword });
            setMessage(res.data.message || "Parola a fost resetata.");
        } catch (err) {
            setMessage(err.response?.data?.message || "Nu am putut reseta parola.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-300 to-blue-200 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-xl">
                <h1 className="text-4xl font-extrabold text-teal-600 mb-2 text-center">Parola noua</h1>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Parola noua" className="w-full p-3 mb-4 rounded-lg border border-gray-300 outline-none" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirma parola" className="w-full p-3 mb-4 rounded-lg border border-gray-300 outline-none" />
                <button onClick={resetPassword} className="w-full p-3 mb-4 bg-teal-400 text-white font-bold rounded-lg">Reseteaza parola</button>
                {message && <p className="text-center text-teal-700 text-sm mb-3">{message}</p>}
                <Link to="/login" className="block text-center text-teal-500 underline font-bold mt-4">Mergi la autentificare</Link>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
