import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Bell, User, LogOut, Settings, Home, ChevronRight, Menu } from "lucide-react";
import { logout } from "../api/auth/logout";

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const handleStorageChange = () => {
            setUser(JSON.parse(localStorage.getItem("user") || "{}"));
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // Format the path for the breadcrumb (e.g., /resource-monitoring -> Resource Monitoring)
    const getPageTitle = (pathname) => {
        if (pathname === "/") return "Dashboard";
        
        const segments = pathname
            .split("/")
            .filter(Boolean) // remove empty strings
            .map(seg => seg.replace(/-/g, " "));
    
        // Option B — Breadcrumb style: "Settings / Profile"
        return segments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ");
    };

    const currentPath = getPageTitle(location.pathname);

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
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* ⚡️ REFINED TOP BAR */}
                <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
                    
                    {/* LEFT: Hamburger + Dynamic Breadcrumbs */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* MOBILE HAMBURGER TOGGLE — visible only below lg */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-1 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors lg:hidden"
                            aria-label="Open navigation menu"
                        >
                            <Menu size={22} />
                        </button>

                        <nav className="flex items-center space-x-2 sm:space-x-3 text-sm">
                            <div 
                                onClick={() => navigate("/dashboard")}
                                className="flex items-center text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"
                            >
                                <Home size={16} />
                            </div>
                            
                            <ChevronRight size={14} className="text-slate-300" />
                            
                            <div className="flex items-center">
                                <span className="font-bold text-slate-800 tracking-tight capitalize text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none">
                                    {currentPath}
                                </span>
                            </div>
                        </nav>
                    </div>

                    {/* RIGHT: Actions & Profile */}
                    <div className="flex items-center space-x-1 sm:space-x-2">

                        {/* Profile Dropdown Area */}
                        <div className="flex items-center pl-2 sm:pl-4 ml-1 sm:ml-2 border-l border-slate-200 gap-2 sm:gap-3">
                            <div className="text-right hidden md:block leading-none">
                                <p className="text-sm font-bold text-slate-800">
                                    {user?.name || "Command Center"}
                                </p>
                                <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-tighter">
                                    {user?.role?.replace('_', ' ') || "Operator"}
                                </p>
                            </div>

                            <div className="relative group cursor-pointer">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm overflow-hidden group-hover:border-blue-300 transition-all">
                                    <User size={18} />
                                </div>
                                
                                {/* Logout Dropdown */}
                                 <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-1 z-50">
                                    <div className="px-4 py-2 border-b border-slate-50">
                                        <p className="text-xs font-bold text-slate-800 truncate">{user?.name || "Command Center"}</p>
                                        <p className="text-[10px] text-slate-500 uppercase truncate">{user?.role?.replace('_', ' ') || "Operator"}</p>
                                    </div>
                                    <button 
                                        onClick={() => navigate("/profile")}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors mt-1"
                                    >
                                        <User size={16} className="text-slate-400" />
                                        <span className="font-semibold">My Profile</span>
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border-t border-slate-50 mt-1"
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
                <main className="flex-1 overflow-y-auto bg-[#f8fafc] text-left">
                    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
};

export default DashboardLayout;