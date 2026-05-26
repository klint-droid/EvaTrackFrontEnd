import API from '../../api';
import type { PaginatedResponse, NotificationItem } from '../types';

export const getAlerts = async (page: number = 1): Promise<PaginatedResponse<NotificationItem>> => {
    const res = await API.get<PaginatedResponse<NotificationItem>>(`/api/notifications?page=${page}`);
    return res.data;
};
