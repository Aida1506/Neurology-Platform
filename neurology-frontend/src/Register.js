import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import registerTitle from "./register_title.png";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("PACIENT");
    const [message, setMessage] = useState("");

    const handleRegister = async () => {
        try {
            const res = await axios.post("http://localhost:8080/api/auth/register", {
                username,
                password,
                role,
            });
            setMessage(res.data.message || "User registered successfully");
            setUsername("");
            setPassword("");
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-300 to-blue-200 flex items-center justify-center p-6">

            {/* Card alb */}
            <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-2xl">

                {/* Logo / Title */}
                <h1 className="text-5xl font-extrabold text-teal-600 mb-8 text-center font-sans">
                    Register
                </h1>


                {/* Username */}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-300 outline-none"
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-300 outline-none"
                />

                {/* Role select */}
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-300 outline-none"
                >
                    <option value="PACIENT">Pacient</option>
                    <option value="MEDIC">Medic</option>
                </select>

                {/* Register button */}
                <button
                    onClick={handleRegister}
                    className="w-full p-3 mb-4 bg-gradient-to-br from-teal-300 to-teal-400 text-white font-bold rounded-lg hover:from-teal-400 hover:to-teal-500 transform hover:scale-105 transition"
                >
                    Register
                </button>

                {/* Message */}
                {message && (
                    <p className="text-red-600 font-semibold mb-4 text-center">{message}</p>
                )}

                {/* Login link */}
                <p className="text-sm text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-teal-500 underline font-bold">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
