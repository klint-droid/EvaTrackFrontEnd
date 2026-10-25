import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    Home,
    Building2,
    Radio,
    Megaphone,
    ClipboardList,
    Truck,
    Users,
    BarChart3,
    UserCog,
    UserCircle,
    LayoutGrid,
    X,
    QrCode,
    CheckCircle2,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { useUserStore } from "../../store/useUserStore";
import { normalizeRole } from "../../utils/roles";

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user) || {};
    const currentRole = normalizeRole(user?.role, user?.role_id);

    const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

    // Close sheet on route changes
    useEffect(() => {
        setIsMoreSheetOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when More sheet is open
    useEffect(() => {
        if (isMoreSheetOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMoreSheetOpen]);

    // Role-based 5 primary bottom navigation items
    let bottomTabs = [];

    if (currentRole === "super_admin") {
        bottomTabs = [
            { id: "users", label: "Users", path: "/user-management", icon: UserCog },
            { id: "profile", label: "Profile", path: "/profile", icon: UserCircle },
        ];
    } else if (currentRole === "evac_personnel") {
        bottomTabs = [
            { id: "home", label: "Home", path: "/dashboard", icon: Home },
            { id: "verify", label: "Verify", path: "/household-verification", icon: QrCode, isHero: true },
            { id: "centers", label: "Centers", path: "/evacuation-centers", icon: Building2 },
            { id: "requests", label: "Requests", path: "/resource-requests", icon: Truck },
            { id: "more", label: "Services", isMore: true, icon: LayoutGrid },
        ];
    } else {
        // evac_admin (default)
        bottomTabs = [
            { id: "home", label: "Home", path: "/dashboard", icon: Home },
            { id: "centers", label: "Centers", path: "/evacuation-centers", icon: Building2 },
            { id: "events", label: "Events", path: "/events", icon: Radio },
            { id: "requests", label: "Requests", path: "/resource-requests", icon: Truck },
            { id: "more", label: "Services", isMore: true, icon: LayoutGrid },
        ];
    }

    // All available services for the user's role (for the GCash-style "More Services" sheet)
    const allServices = [
        {
            title: "Operations & Facilities",
            items: [
                { label: "Dashboard", desc: "Real-time overview & metrics", path: "/dashboard", icon: Home, color: "bg-blue-600", roles: ["evac_admin", "evac_personnel"] },
                { label: "Evacuation Centers", desc: "Shelter directory & capacity", path: "/evacuation-centers", icon: Building2, color: "bg-emerald-600", roles: ["evac_admin", "evac_personnel"] },
                { label: "Disaster Events", desc: "Active alerts & event lifecycle", path: "/events", icon: Radio, color: "bg-rose-600", roles: ["evac_admin"] },
            ]
        },
        {
            title: "Evacuees & Field Ops",
            items: [
                { label: "Household Verification", desc: "Admit & scan evacuee QR codes", path: "/household-verification", icon: Users, color: "bg-amber-600", roles: ["evac_personnel"], badge: "Field Scan" },
                { label: "Master Households", desc: "Registry of evacuee families", path: "/households", icon: Home, color: "bg-indigo-600", roles: ["evac_admin", "evac_personnel"] },
                { label: "Resource Requests", desc: "Relief supplies & aid tracking", path: "/resource-requests", icon: Truck, color: "bg-cyan-600", roles: ["evac_admin", "evac_personnel"] },
                { label: "Issue Reports", desc: "Shelter issues & incident tickets", path: "/center-issue-reports", icon: ClipboardList, color: "bg-orange-600", roles: ["evac_admin", "evac_personnel"] },
            ]
        },
        {
            title: "Communications & Intelligence",
            items: [
                { label: "SMS & Push Broadcast", desc: "Send emergency alerts to citizens", path: "/evacuation-alerts", icon: Megaphone, color: "bg-fuchsia-600", roles: ["evac_admin", "evac_personnel"] },
                { label: "Reports & Analytics", desc: "Charts, demographics & logs", path: "/analytics", icon: BarChart3, color: "bg-teal-600", roles: ["evac_admin", "evac_personnel"] },
                { label: "User Management", desc: "Personnel & account control", path: "/user-management", icon: UserCog, color: "bg-violet-600", roles: ["evac_admin", "super_admin"] },
                { label: "My Profile", desc: "Security, theme & settings", path: "/profile", icon: UserCircle, color: "bg-slate-700", roles: ["evac_admin", "evac_personnel", "super_admin"] },
            ]
        }
    ];

    // Check if the current route belongs to one of the "More" items (to highlight the More tab)
    const isMoreActive = !bottomTabs.some(t => !t.isMore && location.pathname.startsWith(t.path));

    return (
        <>
            {/* FIXED BOTTOM NAVIGATION BAR (Mobile Only: lg:hidden) */}
            <nav 
                aria-label="Mobile Navigation"
                className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)] lg:hidden px-2 pt-1 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] transition-all"
            >
                <div className="flex items-center justify-around max-w-md mx-auto">
                    {bottomTabs.map((tab) => {
                        const Icon = tab.icon;

                        if (tab.isMore) {
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setIsMoreSheetOpen(prev => !prev)}
                                    className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 ${
                                        isMoreSheetOpen || isMoreActive
                                            ? "text-blue-600 dark:text-blue-400 font-semibold"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                                >
                                    <div className={`relative p-1 rounded-lg transition-transform ${
                                        isMoreSheetOpen ? "scale-110 bg-blue-50 dark:bg-blue-950/60" : ""
                                    }`}>
                                        <Icon size={20} strokeWidth={isMoreSheetOpen || isMoreActive ? 2.5 : 2} />
                                    </div>
                                    <span className="text-[11px] tracking-tight mt-0.5 truncate">
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        }

                        // Hero tab style (e.g. Verify Scan for personnel)
                        if (tab.isHero) {
                            return (
                                <NavLink
                                    key={tab.id}
                                    to={tab.path}
                                    className={({ isActive }) => `
                                        relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-150 group
                                        ${isActive ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-600 dark:text-slate-400"}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={`p-2 -mt-4 rounded-full shadow-md transition-transform group-hover:scale-105 ${
                                                isActive 
                                                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950" 
                                                    : "bg-slate-900 dark:bg-slate-800 text-emerald-400 ring-2 ring-slate-200 dark:ring-slate-700"
                                            }`}>
                                                <Icon size={20} strokeWidth={2.4} />
                                            </div>
                                            <span className="text-[11px] tracking-tight mt-0.5 truncate font-bold">
                                                {tab.label}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        }

                        // Standard tab
                        return (
                            <NavLink
                                key={tab.id}
                                to={tab.path}
                                end={tab.path === "/dashboard"}
                                className={({ isActive }) => `
                                    relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150
                                    ${isActive 
                                        ? "text-blue-600 dark:text-blue-400 font-semibold" 
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`relative p-1 rounded-lg transition-transform ${
                                            isActive ? "scale-110 bg-blue-50 dark:bg-blue-950/60" : ""
                                        }`}>
                                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        <span className="text-[11px] tracking-tight mt-0.5 truncate">
                                            {tab.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* GCASH-STYLE "ALL SERVICES & FEATURES" BOTTOM SHEET */}
            {isMoreSheetOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMoreSheetOpen(false)}
                    />

                    {/* Sheet Container */}
                    <div className="relative w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                        
                        {/* Drag Handle & Header */}
                        <div className="pt-3 pb-2 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                            <div>
                                <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles size={16} className="text-blue-500" />
                                    <span>All Features & Services</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Quick 1-tap navigation for your active role
                                </p>
                            </div>
                            <button
                                onClick={() => setIsMoreSheetOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Services List by Group */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">
                            {allServices.map((group) => {
                                const allowedItems = group.items.filter(item => item.roles.includes(currentRole));
                                if (allowedItems.length === 0) return null;

                                return (
                                    <div key={group.title} className="space-y-2">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                                            {group.title}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {allowedItems.map((item) => {
                                                const ItemIcon = item.icon;
                                                const isActive = location.pathname.startsWith(item.path);

                                                return (
                                                    <button
                                                        key={item.path}
                                                        onClick={() => {
                                                            navigate(item.path);
                                                            setIsMoreSheetOpen(false);
                                                        }}
                                                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                                                            isActive
                                                                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/40 text-blue-700 dark:text-blue-300"
                                                                : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-10 h-10 rounded-xl ${item.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                                <ItemIcon size={20} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold truncate">
                                                                        {item.label}
                                                                    </span>
                                                                    {item.badge && (
                                                                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                                                            {item.badge}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                    {item.desc}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="text-slate-400 flex-shrink-0 ml-2" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default BottomNav;
