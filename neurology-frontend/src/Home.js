import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "./logo.png";
import loginButton from "./login_button.png";
import registerButton from "./register_button.png";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "linear-gradient(135deg, #2196F3, #4CAF50)",
        textAlign: "center"
    }}>
      <img src={logo} alt="App Logo" style={{ width: "900px" }} />
      <div style={{  display: "flex",  gap: "20px", flexWrap: "wrap"}}>
        <img
            className="button-image"
           src={loginButton}
           alt="Login"
           onClick={() => navigate("/login")}
        />
        <img
           className="button-image"
           src={registerButton}
           alt="Register"
           onClick={() => navigate("/register")}
        />
      </div>
    </div>
  );
}

export default Home;
