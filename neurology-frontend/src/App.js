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
import ChatbotPage from "./patient/ChatbotPage";
import DoctorDashboard from "./doctor/DoctorDashboard";
import DoctorAppointmentsPage from "./doctor/DoctorAppointmentsPage";
import DoctorPatientsPage from "./doctor/DoctorPatientsPage";
import DoctorMriPage from "./doctor/DoctorMriPage";
import SettingsPage from "./settings/SettingsPage";
import ForgotPasswordPage from "./settings/ForgotPasswordPage";
import ResetPasswordPage from "./settings/ResetPasswordPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AiPage /></ProtectedRoute>} />
          <Route path="/ai-gallery" element={<ProtectedRoute><AiGallery /></ProtectedRoute>} />
          <Route path="/evolution" element={<ProtectedRoute><EvolutionPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage type="patient" /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/programari" element={<ProtectedRoute role="DOCTOR"><DoctorAppointmentsPage /></ProtectedRoute>} />
          <Route path="/doctor/pacienti" element={<ProtectedRoute role="DOCTOR"><DoctorPatientsPage /></ProtectedRoute>} />
          <Route path="/doctor/rmn" element={<ProtectedRoute role="DOCTOR"><DoctorMriPage /></ProtectedRoute>} />
          <Route path="/doctor/setari" element={<ProtectedRoute role="DOCTOR"><SettingsPage type="doctor" /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
