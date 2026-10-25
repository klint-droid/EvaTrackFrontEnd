import API from '../api';

export interface UserNotification {
    id: number;
    user_id: string;
    type: 'center_assignment' | 'center_unassignment' | 'general' | string;
    title: string;
    message: string;
    data?: {
        center_id?: string;
        center_name?: string;
        assigned_by?: string;
        [key: string]: any;
    } | null;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface GetUserNotificationsResponse {
    data: UserNotification[];
    unread_count: number;
}

export const getUserNotifications = async (): Promise<GetUserNotificationsResponse> => {
    const res = await API.get<GetUserNotificationsResponse>('/api/user-notifications');
    return res.data;
};

export const markNotificationAsRead = async (id: number | string): Promise<{ data: UserNotification; unread_count: number }> => {
    const res = await API.patch(`/api/user-notifications/${id}/read`);
    return res.data;
};

export const markAllNotificationsAsRead = async (): Promise<{ message: string; unread_count: number }> => {
    const res = await API.post('/api/user-notifications/mark-all-read');
    return res.data;
};
