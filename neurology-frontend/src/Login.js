import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // <-- import useNavigate

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // <-- initializezi hook-ul

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });

      // dacă loginul a fost valid
      if (res.data.success) { // presupunem că backend trimite success = true
        localStorage.setItem("user", JSON.stringify(res.data.user)); // salvezi datele userului
        navigate("/profile"); // <-- redirecționează către pagina de profil
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-teal-300 to-blue-200 flex items-center justify-center p-6">
          {/* Card alb */}
          <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-2xl">
              {/* Logo / Title */}
              <h1 className="text-5xl font-extrabold text-teal-600 mb-8 text-center font-sans">
                  Login
              </h1>

              <input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-300 outline-none"
              />

              <input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-300 outline-none"
              />

              <button
                  onClick={handleLogin}
                  className="w-full p-3 mb-4 bg-gradient-to-br from-teal-300 to-teal-400 text-white font-bold rounded-lg hover:from-teal-400 hover:to-teal-500 transform hover:scale-105 transition"
              >
                  Login
              </button>

              {message && (
                  <p className="text-red-600 font-semibold mb-4">{message}</p>
              )}

              <p className="text-sm text-center">
                  Already have an account?{" "}
                  <Link to="/register" className="text-teal-500 underline font-bold">
                      Register here
                  </Link>
              </p>
          </div>
      </div>
  );
}

export default Login;
