import React, { useState } from "react";
import axios from "axios";
import {
    Link,
    useNavigate
} from "react-router-dom";

function Login() {

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const navigate = useNavigate();

    const handleLogin = async () => {

        try {

            const res = await axios.post(
                "http://localhost:8080/api/auth/login",
                {
                    username,
                    password,
                },
                { withCredentials: true }
            );
            console.log(res.data);

            if (res.data.success) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(res.data.user)
                );

                const role =
                    res.data.user.role;

                if (role === "DOCTOR") {

                    navigate("/doctor");

                }

                else {

                    navigate("/profile");
                }

            } else {

                setMessage(
                    res.data.message
                );
            }

        } catch (err) {

            console.error(err);

            setMessage(
                err.response?.data?.message
                || "Autentificarea a esuat"
            );
        }
    };

    return (

        <div className="
            min-h-screen
            bg-gradient-to-br
            from-teal-300
            to-blue-200
            flex
            items-center
            justify-center
            p-6
        ">

            
            <div className="
                bg-white
                rounded-xl
                shadow-lg
                p-10
                w-full
                max-w-2xl
            ">

                
                <h1 className="
                    text-5xl
                    font-extrabold
                    text-teal-600
                    mb-2
                    text-center
                    font-sans
                ">
                    Cerebra
                </h1>

                <p className="
                    text-center
                    text-gray-500
                    mb-8
                ">
                    Platforma AI pentru neurologie
                </p>

                
                <input
                    placeholder="Email sau nume de utilizator"
                    value={username}
                    onChange={(e) =>
                        setUsername(
                            e.target.value
                        )
                    }
                    className="
                        w-full
                        p-3
                        mb-4
                        rounded-lg
                        border
                        border-gray-300
                        focus:border-teal-400
                        focus:ring-2
                        focus:ring-teal-300
                        outline-none
                    "
                />

                
                <input
                    placeholder="Parola"
                    type="password"
                    value={password}
                    onChange={(e) =>
                        setPassword(
                            e.target.value
                        )
                    }
                    className="
                        w-full
                        p-3
                        mb-4
                        rounded-lg
                        border
                        border-gray-300
                        focus:border-teal-400
                        focus:ring-2
                        focus:ring-teal-300
                        outline-none
                    "
                />

                
                <button
                    onClick={handleLogin}
                    className="
                        w-full
                        p-3
                        mb-4
                        bg-gradient-to-br
                        from-teal-300
                        to-teal-400
                        text-white
                        font-bold
                        rounded-lg
                        hover:from-teal-400
                        hover:to-teal-500
                        transform
                        hover:scale-105
                        transition
                    "
                >
                    Autentificare
                </button>

                
                {message && (

                    <p className="
                        text-red-600
                        font-semibold
                        mb-4
                        text-center
                    ">
                        {message}
                    </p>
                )}

                
                <p className="
                    text-sm
                    text-center
                ">

                    Nu ai cont?
                    {" "}

                    <Link
                        to="/register"
                        className="
                            text-teal-500
                            underline
                            font-bold
                        "
                    >
                        Creeaza cont aici
                    </Link>

                </p>

                <Link
                    to="/forgot-password"
                    className="
                        block
                        w-full
                        p-3
                        mt-5
                        rounded-lg
                        border
                        border-teal-300
                        text-center
                        text-teal-600
                        font-bold
                        hover:bg-teal-50
                        transition
                    "
                >
                    Am uitat parola - trimite link pe email
                </Link>

            </div>

        </div>
    );
}

export default Login;
