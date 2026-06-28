import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async () => {
        try {
            const res = await axios.post("http://localhost:8080/api/auth/register", {
                username,
                email,
                password,
                role: "PACIENT",
            });

            setMessage(res.data.message || "Utilizator inregistrat cu succes");
            setUsername("");
            setEmail("");
            setPassword("");

        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || "Inregistrarea a esuat");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-300 to-blue-200 flex items-center justify-center p-6">

            
            <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-2xl">

                
                <h1 className="text-5xl font-extrabold text-teal-600 mb-8 text-center font-sans">
                    Creeaza cont
                </h1>


                
                <input
                    type="text"
                    placeholder="Nume de utilizator"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-300 outline-none"
                />

                
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-300 outline-none"
                />

                
                <input
                    type="password"
                    placeholder="Parola"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-300 outline-none"
                />

                
                <button
                    onClick={handleRegister}
                    className="w-full p-3 mb-4 bg-gradient-to-br from-teal-300 to-teal-400 text-white font-bold rounded-lg hover:from-teal-400 hover:to-teal-500 transform hover:scale-105 transition"
                >
                    Inregistreaza-te
                </button>

                
                {message && (
                    <p className="text-red-600 font-semibold mb-4 text-center">{message}</p>
                )}

                
                <p className="text-sm text-center">
                    Ai deja cont?{" "}
                    <Link to="/login" className="text-teal-500 underline font-bold">
                        Autentifica-te aici
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
