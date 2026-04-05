import React from "react";
import Sidebar from "../components/SideBar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Bell, User, LogOut, Settings, Home, ChevronRight } from "lucide-react";
import { logout } from "../api/auth/Logout";

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Format the path for the breadcrumb (e.g., /resource-monitoring -> Resource Monitoring)
    const currentPath = location.pathname === "/" 
        ? "Dashboard" 
        : location.pathname.split("/").pop()?.replace(/-/g, " ");

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
        <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900">
            {/* SIDEBAR */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* ⚡️ REFINED TOP BAR */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    
                    {/* LEFT: Dynamic Breadcrumbs */}
                    <nav className="flex items-center space-x-3 text-sm">
                        <div 
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                            <Home size={16} />
                        </div>
                        
                        <ChevronRight size={14} className="text-slate-300" />
                        
                        <div className="flex items-center">
                            <span className="font-bold text-slate-800 tracking-tight capitalize">
                                {currentPath}
                            </span>
                        </div>
                    </nav>

                    {/* RIGHT: Actions & Profile */}
                    <div className="flex items-center space-x-2">
                        
                        {/* Status Indicator (Pulse effect for emergency systems) */}
                        <div className="hidden lg:flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 mr-4">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Live Monitoring</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                            <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                                <Bell size={19} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                                <Settings size={19} />
                            </button>
                        </div>

                        {/* Profile Dropdown Area */}
                        <div className="flex items-center pl-4 ml-2 border-l border-slate-200 gap-3">
                            <div className="text-right hidden md:block leading-none">
                                <p className="text-sm font-bold text-slate-800">
                                    {user?.name || "Command Center"}
                                </p>
                                <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-tighter">
                                    {user?.role?.replace('_', ' ') || "Operator"}
                                </p>
                            </div>

                            <div className="relative group cursor-pointer">
                                <div className="w-10 h-10 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm overflow-hidden group-hover:border-blue-300 transition-all">
                                    <User size={20} />
                                </div>
                                
                                {/* Logout Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-1 z-50">
                                    <div className="px-4 py-2 border-b border-slate-50 md:hidden">
                                        <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{user?.role}</p>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <LogOut size={16} />
                                        <span className="font-semibold">Secure Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 🧊 MAIN CONTENT AREA */}
                <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
                    <div className="max-w-[1600px] mx-auto p-8">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
};

export default DashboardLayout;