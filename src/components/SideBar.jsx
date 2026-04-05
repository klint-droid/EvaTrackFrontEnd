import React from "react";
import { Link } from "react-router-dom";
import { logout } from "../api/auth/Logout";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="w-64 h-screen bg-white shadow-md p-4 flex flex-col">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-red-600">EvaTrack</h1>
                <p className="text-xs text-gray-500">Evacuation Tracking</p>
            </div>

            <nav className="flex flex-col gap-2">
                {(user?.role === "user" || user?.role === "admin") && (
                    <Link to="/dashboard" className="p-3 rounded-lg hover:bg-gray-100">
                        Dashboard
                    </Link>
                )}

                {(user?.role === "user") && (
                    <Link to="/household-verification" className="p-3 rounded-lg hover:bg-gray-100">
                        Household Verification
                    </Link>
                )}

                {(user?.role === "user" || user?.role === "admin") && (
                    <Link to="/evacuation-alerts" className="p-3 rounded-lg hover:bg-gray-100">
                        Evacuation Alerts
                    </Link>
                )}

                {(user?.role === "user" || user?.role === "admin") && (
                    <Link to="/evacuation-centers" className="p-3 rounded-lg hover:bg-gray-100">
                        Evacuation Centers
                    </Link>
                )}

                {(user?.role === "user" || user?.role === "admin") && (
                    <Link to="/resource-monitoring" className="p-3 rounded-lg hover:bg-gray-100">
                        Resource Monitoring
                    </Link>
                )}

                {(user?.role === "super_admin" || user?.role === "admin") && (
                    <Link to="/users" className="p-3 rounded-lg hover:bg-gray-100">
                        User Management
                    </Link>
                )}
            </nav>

            <div className="mt-auto p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.role}</p>
            </div>
                <button
                    onClick={() => {
                        if (!window.confirm("Are you sure you want to logout?")) return;
                        handleLogout();
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
        </div>
    );
};

export default Sidebar;