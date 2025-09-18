import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
    <div className="login-container">
      <h2>Register</h2>
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
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="PACIENT">Pacient</option>
        <option value="MEDIC">Medic</option>
      </select>
      <button onClick={handleRegister}>Register</button>
      {message && <p>{message}</p>}
      <p>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
