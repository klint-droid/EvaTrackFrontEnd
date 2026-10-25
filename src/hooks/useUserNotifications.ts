import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    UserNotification
} from '../api/userNotifications';

export function useUserNotifications(pollInterval = 30000) {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const isMounted = useRef<boolean>(true);

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await getUserNotifications();
            if (isMounted.current) {
                setNotifications(res.data || []);
                setUnreadCount(res.unread_count || 0);
            }
        } catch (err) {
            // Silently handle error on background polling
        } finally {
            if (isMounted.current && !silent) {
                setLoading(false);
            }
        }
    }, []);

    // Initial fetch & polling
    useEffect(() => {
        isMounted.current = true;
        fetchNotifications(false);

        const timer = setInterval(() => {
            fetchNotifications(true);
        }, pollInterval);

        return () => {
            isMounted.current = false;
            clearInterval(timer);
        };
    }, [fetchNotifications, pollInterval]);

    const handleMarkAsRead = async (id: number | string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await markNotificationAsRead(id);
        } catch (err) {
            // Revert on error
            fetchNotifications(true);
        }
    };

    const handleMarkAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
        );
        setUnreadCount(0);

        try {
            await markAllNotificationsAsRead();
        } catch (err) {
            fetchNotifications(true);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        refresh: () => fetchNotifications(false),
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
    };
}
