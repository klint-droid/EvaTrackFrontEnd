import API from '../../api';

export interface SendAlertPayload {
    message: string;
    urgency_level_id: number;
    channel: 'sms' | 'push' | 'both';
    target_filter: 'all' | 'evacuated' | 'not_evacuated';
    evacuation_event_id?: string | null;
    evacuation_center_id?: string | null;
    scheduled_at?: string | null;
    is_recurring?: boolean;
    recurrence_type?: 'hourly' | 'daily' | 'weekly' | null;
    recurrence_end_at?: string | null;
}

export interface SendAlertResponse {
    message: string;
    notif_id: number;
    status: 'sent' | 'failed' | 'scheduled' | 'pending' | 'cancelled';
    recipient_count: number;
}

export const sendAlert = async (data: SendAlertPayload): Promise<SendAlertResponse> => {
    const res = await API.post<SendAlertResponse>('/api/notifications', data);
    return res.data;
};
