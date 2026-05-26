import API from '../../api';

export interface PreviewRecipientsParams {
    target_filter: 'all' | 'evacuated' | 'not_evacuated';
    evacuation_center_id?: string | null;
    evacuation_event_id?: string | null;
}

export interface PreviewRecipientsResponse {
    recipient_count: number;
}

export const previewRecipients = async (params: PreviewRecipientsParams): Promise<PreviewRecipientsResponse> => {
    const res = await API.get<PreviewRecipientsResponse>('/api/notifications/preview', { params });
    return res.data;
};
