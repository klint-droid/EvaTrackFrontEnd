import API from '../../api';
export const previewRecipients = async (params) => {
    const res = await API.get('/api/notifications/preview', { params });
    return res.data;
};