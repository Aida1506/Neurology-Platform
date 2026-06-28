import { useEffect, useState } from "react";
import axios from "axios";

export default function useDoctor() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        axios
            .get(`http://localhost:8080/api/doctors/me/${user.username}`)
            .then(res => setDoctor(res.data))
            .catch(err => console.error("Eroare la incarcarea medicului:", err))
            .finally(() => setLoading(false));
    }, [user?.username]);

    return { doctor, user, loading };
}
