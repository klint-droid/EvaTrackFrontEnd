import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    Megaphone,
    ClipboardList,
    Truck,
    Users,
    BarChart3,
    UserCog,
    QrCode
} from "lucide-react";
import { useUserStore } from "../../store/useUserStore";
import { normalizeRole } from "../../utils/roles";

const DashboardServicesGrid = ({ 
    hasActiveEvent = false, 
    pendingRequests = 0, 
    openIssues = 0 
}) => {
    const navigate = useNavigate();
    const user = useUserStore(state => state.user) || {};
    const currentRole = normalizeRole(user?.role, user?.role_id);

    // Catalog of all services styled with GCash-inspired visual vibrancy
    const services = [
        {
            id: "verification",
            label: "Verification",
            fullLabel: "Household Verification",
            path: "/household-verification",
            icon: QrCode,
            gradient: "from-emerald-500 to-teal-600 shadow-emerald-500/25",
            roles: ["evac_personnel"],
            badge: "Scan QR",
            badgeColor: "bg-emerald-500 text-white"
        },
        {
            id: "centers",
            label: "Centers",
            fullLabel: "Evacuation Centers",
            path: "/evacuation-centers",
            icon: Building2,
            gradient: "from-blue-500 to-indigo-600 shadow-blue-500/25",
            roles: ["evac_admin", "evac_personnel"],
            badge: null
        },
        {
            id: "requests",
            label: "Requests",
            fullLabel: "Resource Requests",
            path: "/resource-requests",
            icon: Truck,
            gradient: "from-cyan-500 to-blue-600 shadow-cyan-500/25",
            roles: ["evac_admin", "evac_personnel"],
            badge: pendingRequests > 0 ? `${pendingRequests}` : null,
            badgeColor: "bg-amber-500 text-white"
        },
        {
            id: "issues",
            label: "Issue Reports",
            fullLabel: "Center Issues",
            path: "/center-issue-reports",
            icon: ClipboardList,
            gradient: "from-amber-500 to-orange-600 shadow-amber-500/25",
            roles: ["evac_admin", "evac_personnel"],
            badge: openIssues > 0 ? `${openIssues}` : null,
            badgeColor: "bg-rose-500 text-white"
        },
        {
            id: "alerts",
            label: "SMS Alerts",
            fullLabel: "SMS & Push Broadcast",
            path: "/evacuation-alerts",
            icon: Megaphone,
            gradient: "from-fuchsia-500 to-pink-600 shadow-fuchsia-500/25",
            roles: ["evac_admin", "evac_personnel"],
            badge: null
        },
        {
            id: "households",
            label: "Households",
            fullLabel: "Master Households",
            path: "/households",
            icon: Users,
            gradient: "from-indigo-500 to-violet-600 shadow-indigo-500/25",
            roles: ["evac_admin", "evac_personnel"],
            badge: null
        },
        {
            id: "analytics",
            label: "Analytics",
            fullLabel: "Reports & Analytics",
            path: "/analytics",
            icon: BarChart3,
            gradient: "from-teal-500 to-emerald-600 shadow-teal-500/25",
            roles: ["evac_admin", "evac_personnel"],
            badge: null
        },
        {
            id: "users",
            label: "User Admin",
            fullLabel: "User Management",
            path: "/user-management",
            icon: UserCog,
            gradient: "from-violet-500 to-purple-600 shadow-violet-500/25",
            roles: ["evac_admin", "super_admin"],
            badge: null
        },
    ];

    // Filter by active role
    const availableServices = services.filter(s => s.roles.includes(currentRole));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span>Quick Services & Operations</span>
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {availableServices.length} Features
                    </span>
                </div>
            </div>

            {/* GCash-Style 4-Column Service Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-4 gap-x-2 sm:gap-x-4">
                {availableServices.map((service) => {
                    const ServiceIcon = service.icon;

                    return (
                        <button
                            key={service.id}
                            type="button"
                            onClick={() => navigate(service.path)}
                            className="group flex flex-col items-center text-center cursor-pointer focus:outline-none transition-transform active:scale-95"
                        >
                            {/* Icon Tile */}
                            <div className="relative mb-2">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${service.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-200`}>
                                    <ServiceIcon size={24} strokeWidth={2.2} className="sm:w-6 sm:h-6 w-5 h-5" />
                                </div>

                                {/* Mini Notification / Alert Badge */}
                                {service.badge && (
                                    <span className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold shadow-xs ${service.badgeColor || 'bg-blue-600 text-white'}`}>
                                        {service.badge}
                                    </span>
                                )}
                            </div>

                            {/* Service Label */}
                            <span className="text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-tight line-clamp-2 max-w-[76px] transition-colors">
                                {service.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardServicesGrid;
