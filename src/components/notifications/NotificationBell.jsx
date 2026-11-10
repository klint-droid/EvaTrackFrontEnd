import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCheck,
    Building2,
    LogOut,
    Info,
    ExternalLink,
    ChevronRight,
    Loader2,
    Package,
    CheckCircle2
} from 'lucide-react';
import { useUserNotifications } from '../../hooks/useUserNotifications';

function formatRelativeTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getNotificationSeenKey() {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user?.id) return `evatrack:notifications_last_seen_${user.id}`;
        }
    } catch {
        // ignore
    }
    return 'evatrack:notifications_last_seen';
}

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useUserNotifications();

    // Track when notifications were last seen/opened by the user
    const [lastSeenAt, setLastSeenAt] = useState(() => {
        try {
            return localStorage.getItem(getNotificationSeenKey());
        } catch {
            return null;
        }
    });

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle toggle dropdown (vanishes exterior bell badge like Facebook)
    const handleToggleDropdown = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);

        // When opening the dropdown, record current timestamp as seen
        if (nextState) {
            const now = new Date().toISOString();
            setLastSeenAt(now);
            try {
                localStorage.setItem(getNotificationSeenKey(), now);
            } catch (err) {
                console.error('Failed to save last seen notification time', err);
            }
        }
    };

    // Calculate unseen notifications for the exterior bell icon
    // Any unread notification created after lastSeenAt will trigger the bell counter
    const unseenCount = notifications.filter(notif => {
        if (notif.read_at) return false;
        if (!lastSeenAt) return true;
        const notifTime = new Date(notif.created_at).getTime();
        const seenTime = new Date(lastSeenAt).getTime();
        return Number.isFinite(notifTime) && Number.isFinite(seenTime) ? notifTime > seenTime : false;
    }).length;

    const showBellBadge = !isOpen && unseenCount > 0;

    // Handle notification click
    const handleNotificationClick = async (notif) => {
        if (!notif.read_at) {
            await markAsRead(notif.id);
        }

        setIsOpen(false);
        if (notif.data?.link) {
            navigate(notif.data.link);
        } else if (notif.data?.request_id) {
            navigate('/resource-requests');
        } else if (notif.data?.center_id) {
            navigate(`/evacuation-centers/${notif.data.center_id}`);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'resource_request_created':
                return (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <Package size={16} />
                    </div>
                );
            case 'resource_request_status':
                return (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={16} />
                    </div>
                );
            case 'center_assignment':
                return (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} />
                    </div>
                );
            case 'center_unassignment':
                return (
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                        <LogOut size={16} />
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                        <Info size={16} />
                    </div>
                );
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell trigger button */}
            <button
                onClick={handleToggleDropdown}
                className="relative p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors focus:outline-none"
                aria-label="View notifications"
                title="Notifications"
            >
                <Bell size={18} />

                {/* Exterior unread badge & ping effect (vanishes when bell is clicked, Facebook style) */}
                {showBellBadge && (
                    <>
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping" />
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                            {unseenCount > 9 ? '9+' : unseenCount}
                        </span>
                    </>
                )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
                    {/* Header */}
                    <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 ? (
                                <span className="text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                    {unreadCount} unread
                                </span>
                            ) : (
                                <span className="text-[11px] font-medium text-slate-400">All caught up</span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                                title="Mark all as read"
                            >
                                <CheckCheck size={14} />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                <span className="text-xs">Loading notifications...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 px-6 text-center flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
                                    <Bell size={22} />
                                </div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No notifications yet</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
                                    When you are assigned to an evacuation center or receive system updates, they will appear here.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const isUnread = !notif.read_at;
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative border-l-4 ${
                                            isUnread
                                                ? 'bg-blue-50/70 dark:bg-blue-950/35 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 border-blue-600 dark:border-blue-500'
                                                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'
                                        }`}
                                    >
                                        {/* Notification Type Icon */}
                                        {getIconForType(notif.type)}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <h4 className={`text-xs leading-tight truncate ${
                                                    isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'
                                                }`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                    {formatRelativeTime(notif.created_at)}
                                                </span>
                                            </div>

                                            <p className={`text-xs leading-snug break-words ${
                                                isUnread ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                                {notif.message}
                                            </p>

                                            {/* Center link badge if present */}
                                            {notif.data?.center_id && (
                                                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                                    <span>Open center dashboard</span>
                                                    <ChevronRight size={12} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Status indicator dot on the right */}
                                        {isUnread && (
                                            <div className="flex-shrink-0 self-center pl-1">
                                                <span className="block w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 ring-4 ring-blue-100 dark:ring-blue-950/80" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer note */}
                    <div className="p-2.5 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            Real-time personnel & center alerts
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
