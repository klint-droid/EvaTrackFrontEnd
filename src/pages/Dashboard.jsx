import React, { useState, useEffect } from "react";
import API from "../api";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await API.get("/api/user");
                setUser(res.data);
            } catch (err) {
                console.log("User not loaded yet");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome, {user?.name}</p>
            <p>Role: {user?.role}</p>
        </div>
    );
};

export default Dashboard;