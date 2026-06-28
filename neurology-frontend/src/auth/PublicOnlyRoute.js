import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

function PublicOnlyRoute({ children }) {
    const [state, setState] = useState({ loading: true, user: null });

    useEffect(() => {
        let active = true;

        axios
            .get("http://localhost:8080/api/auth/me")
            .then(res => {
                if (!active) return;
                localStorage.setItem("user", JSON.stringify(res.data));
                setState({ loading: false, user: res.data });
            })
            .catch(() => {
                if (!active) return;
                setState({ loading: false, user: null });
            });

        return () => {
            active = false;
        };
    }, []);

    if (state.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">
                Se verifica sesiunea...
            </div>
        );
    }

    if (state.user) {
        return <Navigate to={state.user.role === "DOCTOR" ? "/doctor" : "/profile"} replace />;
    }

    return children;
}

export default PublicOnlyRoute;
