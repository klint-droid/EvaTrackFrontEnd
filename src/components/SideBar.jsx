import logo from "../assets/evatrack_logo_horizontal.svg";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../api/auth/logout";
import {
    Home,
    Bell,
    Radio,
    Building2,
    Megaphone,
    ClipboardList,
    Truck,
    Users,
    BarChart3,
    User,
    UserCog,
    UserCircle,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
    MapPin
} from "lucide-react";

import { useUserStore } from "../store/useUserStore";

const Sidebar = ({ isOpen, onClose, isCollapsed: externalIsCollapsed }) => {
    const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
    const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
    const user = useUserStore(state => state.user) || {};
    const setUser = useUserStore(state => state.setUser);
    const navigate = useNavigate();

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

    const navPrimary = [
        { icon: Home, label: "For you", path: "/dashboard", roles: ["evac_personnel", "evac_admin", "super_admin"] },
    ];

    const navWorkspaces = [
        { icon: Building2, label: "Evacuation Centers", path: "/evacuation-centers", roles: ["evac_personnel", "evac_admin", "super_admin"] },
        { icon: Radio, label: "Disaster Events", path: "/events", roles: ["evac_admin", "super_admin"] },
        { icon: Megaphone, label: "Alerts & Broadcasts", path: "/evacuation-alerts", roles: ["evac_personnel", "evac_admin", "super_admin"] },
        { icon: ClipboardList, label: "Issue Reports", path: "/center-issue-reports", roles: ["evac_admin", "evac_personnel", "super_admin"] },
        { icon: Truck, label: "Resource Requests", path: "/resource-requests", roles: ["evac_personnel", "evac_admin", "super_admin"] },
        { icon: Users, label: "Household Verification", path: "/household-verification", roles: ["evac_personnel", "evac_admin", "super_admin"] },
        { icon: Home, label: "Households", path: "/households", roles: ["evac_admin", "evac_personnel", "super_admin"] },
        { icon: BarChart3, label: "Reports & Analytics", path: "/analytics", roles: ["evac_personnel", "evac_admin", "super_admin"] },
        { icon: UserCog, label: "User Management", path: "/user-management", roles: ["evac_admin", "super_admin"] },
        { icon: UserCircle, label: "My Profile", path: "/profile", roles: ["evac_personnel", "evac_admin", "super_admin"] },
    ];

    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <>
            {/* MOBILE BACKDROP OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            <aside 
                className={`
                    flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none

                    /* MOBILE: Fixed overlay drawer */
                    fixed top-0 left-0 h-full z-50
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    w-60

                    /* DESKTOP (lg+): Inline flex sidebar */
                    lg:relative lg:translate-x-0 lg:transition-all lg:duration-300 lg:z-10
                    ${isCollapsed ? "lg:w-20" : "lg:w-60"}
                `}
            >
                {/* MOBILE CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-3 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
                >
                    <X size={18} />
                </button>

                {/* NAVIGATION CONTENT */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
                    {/* PRIMARY NAV GROUP */}
                    <div className="space-y-0.5">
                        {navPrimary
                            .filter(item => !item.roles || item.roles.includes(user?.role))
                            .map((item) => (
                                <NavLink
                                    key={item.path + item.label}
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={({ isActive }) => `
                                        w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group relative
                                        ${isActive 
                                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-semibold" 
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"}
                                    `}
                                >
                                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? "mx-auto" : ""}`} />
                                    {!isCollapsed && (
                                        <span className="truncate">
                                            {item.label}
                                        </span>
                                    )}

                                    {/* TOOLTIP FOR COLLAPSED STATE */}
                                    {isCollapsed && (
                                        <div className="fixed left-20 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden lg:block z-50">
                                            {item.label}
                                        </div>
                                    )}
                                </NavLink>
                            ))}
                    </div>

                    {/* WORKSPACES NAV GROUP */}
                    <div>
                        {!isCollapsed ? (
                            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Workspaces
                            </div>
                        ) : (
                            <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
                        )}
                        <div className="space-y-0.5">
                            {navWorkspaces
                                .filter(item => !item.roles || item.roles.includes(user?.role))
                                .map((item) => (
                                    <NavLink
                                        key={item.path + item.label}
                                        to={item.path}
                                        onClick={handleNavClick}
                                        className={({ isActive }) => `
                                            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group relative
                                            ${isActive 
                                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-semibold" 
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"}
                                        `}
                                    >
                                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? "mx-auto" : ""}`} />
                                        {!isCollapsed && (
                                            <span className="truncate">
                                                {item.label}
                                            </span>
                                        )}

                                        {/* TOOLTIP FOR COLLAPSED STATE */}
                                        {isCollapsed && (
                                            <div className="fixed left-20 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden lg:block z-50">
                                                {item.label}
                                            </div>
                                        )}
                                    </NavLink>
                                ))}
                        </div>
                    </div>
                </div>

                {/* FOOTER / LOGOUT */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    >
                        <LogOut className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? "mx-auto" : ""}`} />
                        {!isCollapsed && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;