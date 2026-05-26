import API from '../../api';

interface CancelAlertResponse {
    message: string;
    notif_id: string;
}

export const cancelAlert = async (id: string): Promise<CancelAlertResponse> => {
    const res = await API.delete(`/api/notifications/${id}`);
    return res.data
};