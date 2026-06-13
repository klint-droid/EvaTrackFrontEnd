import API from '../../api';
import type { PaginatedResponse, NotificationItem } from '../types';

export const getAlerts = async (page: number = 1, eventId?: string | number): Promise<PaginatedResponse<NotificationItem>> => {
    let url = `/api/notifications?page=${page}`;
    if (eventId) url += `&event_id=${eventId}`;
    const res = await API.get<PaginatedResponse<NotificationItem>>(url);
    return res.data;
};
