import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/my-logo.png"; // pune aici imaginea ta

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f0f4f8",
      textAlign: "center"
    }}>
      <img src={logo} alt="App Logo" style={{ width: "150px", marginBottom: "40px" }} />
      <h1>Welcome to Neurology App</h1>
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            marginRight: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white"
          }}
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#2196F3",
            color: "white"
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Home;
