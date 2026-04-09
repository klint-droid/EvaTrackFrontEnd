import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../api/auth/Logout";
import {
    LayoutDashboard,
    Users,
    Home,
    Send,
    Package,
    BarChart3,
    FileText,
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
} from "lucide-react";

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
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

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["user", "admin", "super_admin"] },
        { icon: Users, label: "Household", path: "/household-verification", roles: ["user"] },
        { icon: Send, label: "Alerts", path: "/evacuation-alerts", roles: ["user", "admin"] },
        { icon: Home, label: "Centers", path: "/evacuation-centers", roles: ["user", "admin"] },
        { icon: Package, label: "Resources", path: "/resource-monitoring", roles: ["user", "admin"] },
        { icon: BarChart3, label: "Analytics", path: "/analytics", roles: ["admin"] },
        { icon: FileText, label: "Reports", path: "/reports", roles: ["admin"] },
        { icon: User, label: "Users", path: "/user-management", roles: ["admin","super_admin"] },
    ];

    return (
        <aside 
            className={`relative flex flex-col bg-[#0f172a] border-r border-slate-800 transition-all duration-300 ease-in-out shadow-2xl
            ${isCollapsed ? "w-20" : "w-64"}`}
        >
            {/* COLLAPSE TOGGLE BUTTON */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 bg-blue-600 text-white rounded-full p-1 border-2 border-[#0f172a] hover:bg-blue-500 transition-colors z-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* BRANDING / LOGO SECTION */}
            <div className="h-20 flex items-center px-5 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="min-w-[40px] h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldAlert size={22} className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden whitespace-nowrap">
                            <span className="text-lg font-bold tracking-tight text-white italic">
                                EVA<span className="text-blue-500">TRACK</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium tracking-[0.2em] -mt-1 uppercase">
                                Precision Safety
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems
                    .filter(item => item.roles.includes(user?.role))
                    .map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
                                ${isActive 
                                    ? "bg-blue-600/10 text-blue-400 ring-1 ring-inset ring-blue-500/20" 
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"}
                            `}
                        >
                            <item.icon size={20} className={`${isCollapsed ? "mx-auto" : ""} flex-shrink-0`} />
                            {!isCollapsed && (
                                <span className="text-sm font-medium tracking-wide">
                                    {item.label}
                                </span>
                            )}
                            
                            {/* TOOLTIP FOR COLLAPSED STATE */}
                            {isCollapsed && (
                                <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
            </nav>

            {/* FOOTER / USER SECTION */}
            <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                >
                    <LogOut size={20} className={isCollapsed ? "mx-auto" : ""} />
                    {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;