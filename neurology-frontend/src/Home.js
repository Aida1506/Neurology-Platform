import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaSignInAlt, FaUserPlus } from "react-icons/fa";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-300 to-blue-200 flex items-center justify-center p-6">

            
            <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center gap-8 w-full max-w-2xl">

                
                <h1 className="text-7xl font-extrabold text-teal-700 font-sans text-center flex items-center gap-4">
                    <FaBrain className="text-teal-500" /> Cerebra
                </h1>

                
                <p className="text-gray-700 text-lg font-medium text-center">
                    Platforma inteligentă pentru sănătate și monitorizare
                </p>

                
                <div className="flex gap-8 justify-center flex-wrap mt-6">
                    <button
                        onClick={() => navigate("/login")}
                        className="w-64 h-16 bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 font-sans flex items-center justify-center gap-3"
                    >
                        <FaSignInAlt className="w-6 h-6" />
                        Autentificare
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        className="w-64 h-16 bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 font-sans flex items-center justify-center gap-3"
                    >
                        <FaUserPlus className="w-6 h-6" />
                        Creeaza cont
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Home;
