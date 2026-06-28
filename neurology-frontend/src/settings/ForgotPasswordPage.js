import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const sendReset = async () => {
        try {
            const res = await axios.post("http://localhost:8080/api/settings/forgot-password", { email });
            setMessage(res.data.message || "Verifica emailul pentru linkul de resetare.");
        } catch (err) {
            setMessage(err.response?.data?.message || "Nu am putut trimite emailul.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-300 to-blue-200 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-xl">
                <h1 className="text-4xl font-extrabold text-teal-600 mb-2 text-center">Resetare parola</h1>
                <p className="text-center text-gray-500 mb-8">Introdu adresa de email salvata la cont.</p>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 mb-4 rounded-lg border border-gray-300 outline-none" />
                <button onClick={sendReset} className="w-full p-3 mb-4 bg-teal-400 text-white font-bold rounded-lg">Trimite link pe email</button>
                {message && <p className="text-center text-teal-700 text-sm mb-3">{message}</p>}
                <Link to="/login" className="block text-center text-teal-500 underline font-bold mt-4">Inapoi la autentificare</Link>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
