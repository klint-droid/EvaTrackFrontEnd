import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/SideBar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Bell, User, LogOut, Settings, LayoutGrid, Search, HelpCircle, Moon, Sun, PanelLeft, Plus, Building2, Megaphone, ClipboardList, Truck, Users, BarChart3, Home, ChevronDown, ArrowRight } from "lucide-react";
import { logout } from "../api/auth/logout";
import { useUserStore } from "../store/useUserStore";
import { useTheme } from "../context/ThemeContext";

function TargetLogo({ onClick }) {
    return (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onClick}>
            <svg viewBox="0 0 72 72" className="w-7 h-7 flex-shrink-0">
                <g transform="translate(36 36)">
                    <circle r="25" fill="#0D1F2D"/>
                    <circle r="24" fill="none" stroke="#0D9E6E" strokeWidth="1" opacity=".3"/>
                    <polygon points="0,-31 -4,-22 0,-24 4,-22" fill="#0D9E6E"/>
                    <polygon points="0,31 -4,22 0,24 4,22" fill="#0D9E6E"/>
                    <polygon points="-31,0 -22,-4 -24,0 -22,4" fill="#0D9E6E"/>
                    <polygon points="31,0 22,-4 24,0 22,4" fill="#0D9E6E"/>
                    <circle cx="-8" cy="-2" r="4.5" fill="#fff" opacity=".65"/>
                    <path d="M-15 13Q-15 4-8 4Q-1 4-1 13Z" fill="#fff" opacity=".65"/>
                    <circle cx="8" cy="-2" r="4.5" fill="#fff" opacity=".65"/>
                    <path d="M1 13Q1 4 8 4Q15 4 15 13Z" fill="#fff" opacity=".65"/>
                    <circle cy="-6" r="6" fill="#fff"/>
                    <path d="M-10 15Q-10 3 0 3Q10 3 10 15Z" fill="#fff"/>
                </g>
            </svg>
            <span className="font-black text-lg tracking-tight leading-none">
                <span className="text-blue-600 dark:text-blue-500">Eva</span>
                <span className="text-emerald-500 dark:text-emerald-400">Track</span>
            </span>
        </div>
    );
}

const workspacesList = [
    { icon: Home, label: "Home", path: "/dashboard", bg: "bg-slate-800" },
    { icon: Building2, label: "Evacuation Centers", path: "/evacuation-centers", bg: "bg-blue-600" },
    { icon: Megaphone, label: "Alerts & Broadcasts", path: "/evacuation-alerts", bg: "bg-rose-500" },
    { icon: ClipboardList, label: "Issue Reports", path: "/center-issue-reports", bg: "bg-amber-500" },
    { icon: Truck, label: "Resource Requests", path: "/resource-requests", bg: "bg-emerald-600" },
    { icon: Users, label: "Household Verification", path: "/household-verification", bg: "bg-indigo-600" },
    { icon: BarChart3, label: "Reports & Analytics", path: "/analytics", bg: "bg-purple-600" },
];

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useUserStore(state => state.user) || {};
    const setUser = useUserStore(state => state.setUser);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { isDarkMode, toggleTheme } = useTheme();

    const workspaceRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (workspaceRef.current && !workspaceRef.current.contains(e.target)) {
                setIsWorkspaceOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    };

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
            
            {/* TOP HEADER BAR */}
            <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 transition-colors duration-300">
                
                {/* LEFT: Logo + Sidebar Toggle + Workspaces Grid Dropdown + Home Pill */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* LOGO */}
                    <TargetLogo onClick={() => navigate("/dashboard")} />

                    {/* SIDEBAR PANEL TOGGLE ICON */}
                    <button
                        onClick={() => {
                            if (window.innerWidth < 1024) {
                                // Mobile: open/close the drawer
                                setIsSidebarOpen(prev => !prev);
                            } else {
                                // Desktop: collapse/expand the inline sidebar
                                setIsSidebarCollapsed(prev => !prev);
                            }
                        }}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors ml-1"
                        aria-label="Toggle navigation menu"
                        title="Toggle Navigation"
                    >
                        <PanelLeft size={18} />
                    </button>

                    {/* WORKSPACES APP GRID DROPDOWN (Atlassian Style matching Photo 2) */}
                    <div className="relative hidden sm:block" ref={workspaceRef}>
                        <button
                            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                            className={`p-1.5 rounded-md transition-colors ${
                                isWorkspaceOpen
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                            title="Workspaces"
                        >
                            <LayoutGrid size={18} />
                        </button>

                        {/* WORKSPACES DROPDOWN MENU */}
                        {isWorkspaceOpen && (
                            <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[9999] p-2 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                                {/* Section Title Header */}
                                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workspaces</span>
                                    <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                        EvaTrack
                                    </span>
                                </div>

                                {/* App List */}
                                <div className="space-y-0.5">
                                    {workspacesList.map((ws) => (
                                        <div
                                            key={ws.path + ws.label}
                                            onClick={() => {
                                                navigate(ws.path);
                                                setIsWorkspaceOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
                                        >
                                            <div 
                                                style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                                                className={`rounded-lg ${ws.bg} text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                                            >
                                                <ws.icon style={{ width: "16px", height: "16px", minWidth: "16px", minHeight: "16px" }} className="text-white flex-shrink-0" />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap">
                                                {ws.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom Footer */}
                                <div 
                                    onClick={() => {
                                        navigate("/evacuation-centers");
                                        setIsWorkspaceOpen(false);
                                    }}
                                    className="p-2.5 mt-1 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-b-lg"
                                >
                                    <span>View all workspaces</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* HOME PILL BADGE */}
                    <div 
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <User className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                        <span>Home</span>
                    </div>
                </div>

                {/* FAR RIGHT: ACTION ICONS & PROFILE */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                        onClick={toggleTheme}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        aria-label="Toggle Dark Mode"
                        title="Toggle Theme"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* USER AVATAR BADGE */}
                    <div className="relative group cursor-pointer ml-1">
                        <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white text-xs font-bold flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
                            {user?.profile_photo_url ? (
                                <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>{(user?.first_name || user?.name || "IA").slice(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                        
                        {/* Logout Dropdown */}
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-1 z-50">
                            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name || "Command Center"}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase truncate">{user?.role?.replace('_', ' ') || "Operator"}</p>
                            </div>
                            <button 
                                onClick={() => navigate("/profile")}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors mt-0.5"
                            >
                                <User size={14} className="text-slate-400" />
                                <span className="font-semibold">My Profile</span>
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors border-t border-slate-100 dark:border-slate-800 mt-0.5"
                            >
                                <LogOut size={14} />
                                <span className="font-semibold">Secure Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* BODY CONTAINER: SIDEBAR + MAIN CONTENT */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* SIDEBAR */}
                <Sidebar isOpen={isSidebarOpen} isCollapsed={isSidebarCollapsed} onClose={() => setIsSidebarOpen(false)} />

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 text-left">
                    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>

        </div>
    );
};

export default DashboardLayout;