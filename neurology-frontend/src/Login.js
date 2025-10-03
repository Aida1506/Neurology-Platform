import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // <-- import useNavigate
import "./Login.css";
import loginTitle from "./login_title.png";

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
    <div className="login-container">
      <img src={loginTitle} alt="Login" className="login-title" />
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {message && <p className="message">{message}</p>}
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
