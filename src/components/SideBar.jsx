import logo from "../assets/logo.png";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../api/auth/logout";
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
    ShieldAlertIcon,
    AlertTriangle,
    X,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
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
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["evac_personnel", "evac_admin", "super_admin"] },
        { icon: Home, label: "Household Status", path: "/households", roles: ["evac_admin", "evac_personnel"] },
        { icon: Users, label: "Household Verification", path: "/household-verification", roles: ["evac_personnel", "evac_admin"] },
        { icon: ShieldAlertIcon, label: "Events", path: "/events", roles: ["evac_admin"] },
        { icon: Send, label: "Alerts", path: "/evacuation-alerts", roles: ["evac_personnel", "evac_admin"] },
        { icon: Home, label: "Centers", path: "/evacuation-centers", roles: ["evac_personnel", "evac_admin"] },
        { icon: Package, label: "Resources", path: "/resource-requests", roles: ["evac_personnel", "evac_admin"] },
        { icon: BarChart3, label: "Analytics", path: "/analytics", roles: ["evac_personnel", "evac_admin"] },
        { icon: AlertTriangle, label: "Center Issues", path: "/center-issue-reports", roles: ["evac_admin", "evac_personnel"] },
        { icon: User, label: "Users", path: "/user-management", roles: ["evac_admin","super_admin"] },
    ];

    // On mobile, clicking a nav link should also close the drawer
    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <>
            {/* MOBILE BACKDROP OVERLAY — only visible on screens < lg when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            <aside 
                className={`
                    flex flex-col bg-[#0f172a] border-r border-slate-800 shadow-2xl

                    /* ── MOBILE: Fixed overlay drawer ── */
                    fixed top-0 left-0 h-full z-50
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    w-64

                    /* ── DESKTOP (lg+): Restore original inline behavior ── */
                    lg:relative lg:translate-x-0 lg:transition-all lg:duration-300
                    ${isCollapsed ? "lg:w-20" : "lg:w-64"}
                `}
            >
                {/* MOBILE CLOSE BUTTON — visible only below lg */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors lg:hidden"
                >
                    <X size={18} />
                </button>

                {/* DESKTOP COLLAPSE TOGGLE BUTTON — hidden on mobile */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 bg-blue-600 text-white rounded-full p-1 border-2 border-[#0f172a] hover:bg-blue-500 transition-colors z-50 hidden lg:flex items-center justify-center"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* BRANDING / LOGO SECTION */}
                <div className="h-20 flex items-center px-5 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="min-w-[40px] h-10 flex items-center justify-center">
    <img 
        src={logo} 
        alt="logo" 
        className="h-10 w-10 object-contain"
    />
</div>
                        {/* On mobile drawer: always show label. On desktop: respect collapse state */}
                        {(!isCollapsed || isOpen) && (
                            <div className={`flex flex-col overflow-hidden whitespace-nowrap ${isCollapsed ? "lg:hidden" : ""}`}>
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
                                onClick={handleNavClick}
                                className={({ isActive }) => `
                                    flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive 
                                        ? "bg-blue-600/10 text-blue-400 ring-1 ring-inset ring-blue-500/20" 
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"}
                                `}
                            >
                                <item.icon size={20} className={`${isCollapsed && !isOpen ? "lg:mx-auto" : ""} flex-shrink-0`} />
                                {/* On mobile drawer: always show labels. On desktop: respect collapse */}
                                {(!isCollapsed || isOpen) && (
                                    <span className={`text-sm font-medium tracking-wide ${isCollapsed ? "lg:hidden" : ""}`}>
                                        {item.label}
                                    </span>
                                )}
                                
                                {/* TOOLTIP FOR COLLAPSED STATE — desktop only */}
                                {isCollapsed && !isOpen && (
                                    <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden lg:block">
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
                        <LogOut size={20} className={isCollapsed && !isOpen ? "lg:mx-auto" : ""} />
                        {(!isCollapsed || isOpen) && <span className={`text-sm font-medium ${isCollapsed ? "lg:hidden" : ""}`}>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;