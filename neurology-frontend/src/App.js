import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Profile from "./patient/Profile";
import AiPage from "./patient/AiPage";
import AiGallery from "./patient/AiGallery";
import EvolutionPage from "./patient/EvolutionPage";
import CalendarPage from "./patient/CalendarPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/ai-gallery" element={<AiGallery />} />
          <Route path="/evolution" element={<EvolutionPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </Router>
  );
}

export default App;
