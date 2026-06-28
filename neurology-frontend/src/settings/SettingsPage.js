import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiBarChart2, FiCalendar, FiHome, FiImage, FiLock, FiLogOut, FiMail, FiMessageCircle, FiSettings, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import InfoTour from "../components/InfoTour";

function SettingsPage({ type = "patient" }) {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const navigate = useNavigate();

    const [profile, setProfile] = useState({ username: user?.username || "", email: "", role: user?.role || "" });
    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    const isDoctor = type === "doctor";
    const tourSteps = [
        {
            title: "Date cont",
            description: "Aici vezi numele de utilizator si poti actualiza emailul folosit pentru resetarea parolei."
        },
        {
            title: "Schimba parola",
            description: "Completeaza parola curenta, parola noua si confirmarea, apoi salveaza modificarea."
        },
        {
            title: "Resetare prin email",
            description: "Trimite un link de resetare pe emailul salvat la cont."
        },
        {
            title: "Iesire din cont",
            description: "Inchide sesiunea curenta si revino la pagina de autentificare."
        }
    ];

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8080/api/auth/logout");
        } catch (err) {
            console.error("Iesirea din cont a esuat:", err);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    useEffect(() => {
        if (!user?.username) return;
        axios
            .get(`http://localhost:8080/api/settings/${user.username}`)
            .then(res => setProfile(res.data))
            .catch(() => setProfileMessage("Nu am putut incarca setarile."));
    }, [user?.username]);

    const saveProfile = async () => {
        try {
            const res = await axios.put(`http://localhost:8080/api/settings/${user.username}`, {
                email: profile.email
            });
            setProfile(res.data);
            setProfileMessage("Datele au fost salvate.");
        } catch (err) {
            setProfileMessage(err.response?.data?.message || "Nu am putut salva datele.");
        }
    };

    const changePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage("Parolele noi nu coincid.");
            return;
        }

        try {
            await axios.put(`http://localhost:8080/api/settings/${user.username}/password`, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordMessage("Parola a fost schimbata.");
        } catch (err) {
            setPasswordMessage(err.response?.data?.message || "Nu am putut schimba parola.");
        }
    };

    const sendResetEmail = async () => {
        try {
            const res = await axios.post("http://localhost:8080/api/settings/forgot-password", {
                usernameOrEmail: profile.email || user.username
            });
            setResetMessage(res.data.message || "Emailul de resetare a fost trimis.");
        } catch (err) {
            setResetMessage(err.response?.data?.message || "Nu am putut trimite emailul.");
        }
    };

    const patientNav = (
        <>
            <button onClick={() => navigate("/profile")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiHome /> Panou pacient</button>
            <button onClick={() => navigate("/evolution")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiBarChart2 /> Evolutie</button>
            <button onClick={() => navigate("/calendar")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiCalendar /> Calendar</button>
            <button onClick={() => navigate("/chatbot")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiMessageCircle /> Chatbot</button>
            <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-teal-600 shadow text-white"><FiSettings /> Setari</button>
        </>
    );

    const doctorNav = (
        <>
            <button onClick={() => navigate("/doctor")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiHome /> Medic</button>
            <button onClick={() => navigate("/doctor/programari")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiCalendar /> Programari</button>
            <button onClick={() => navigate("/doctor/pacienti")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiUsers /> Pacienti</button>
            <button onClick={() => navigate("/doctor/rmn")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-teal-500/70 text-white"><FiImage /> RMN</button>
            <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-teal-600 shadow text-white"><FiSettings /> Setari</button>
        </>
    );

    return (
        <div className="min-h-screen flex font-sans bg-gradient-to-br from-teal-50 via-white to-blue-50">
            <aside className="w-64 h-screen sticky top-0 bg-gradient-to-b from-teal-400 to-blue-300 p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Cerebra</h1>
                <nav className="flex flex-col gap-4">{isDoctor ? doctorNav : patientNav}</nav>
            </aside>

            <main className="flex-1 h-screen overflow-y-auto p-6 flex flex-col gap-6">
                <div className="bg-gradient-to-r from-teal-400 to-blue-300 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Setari cont</h2>
                    </div>
                    <InfoTour steps={tourSteps} />
                </div>

                <section className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 border border-teal-100">
                    <div>
                        <div className="flex items-center gap-2 text-gray-800 font-semibold"><FiMail /> Date cont</div>
                    </div>
                    <input value={profile.username} disabled className="border border-gray-100 rounded-xl p-3 bg-gray-100 text-gray-500" />
                    <input
                        value={profile.email || ""}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        placeholder="Email pentru resetarea parolei"
                        className="border border-teal-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <button onClick={saveProfile} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-xl w-fit">Salveaza datele</button>
                    {profileMessage && <p className="text-sm text-teal-700">{profileMessage}</p>}
                </section>

                <section className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 border border-teal-100">
                    <div>
                        <div className="flex items-center gap-2 text-gray-800 font-semibold"><FiLock /> Schimba parola</div>
                    </div>
                    <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="Parola curenta" className="border border-teal-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                    <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Parola noua" className="border border-teal-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                    <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Confirma parola noua" className="border border-teal-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                    <button onClick={changePassword} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-xl w-fit">Schimba parola</button>
                    {passwordMessage && <p className="text-sm text-teal-700">{passwordMessage}</p>}
                </section>

                <section className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 border border-teal-100">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold"><FiMail /> Resetare prin email</div>
                    <button onClick={sendResetEmail} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-xl w-fit">Trimite email de resetare</button>
                    {resetMessage && <p className="text-sm text-teal-700">{resetMessage}</p>}
                </section>

                <section className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 border border-teal-100">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold"><FiLogOut /> Iesire din cont</div>
                    <button onClick={handleLogout} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-xl w-fit">Iesi din cont</button>
                </section>
            </main>
        </div>
    );
}

export default SettingsPage;
