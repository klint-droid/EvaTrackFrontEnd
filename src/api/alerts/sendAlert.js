import API from '../../api';
export const sendAlert = async (data) => {
    const res = await API.post('/api/notifications', data);
    return res.data;
};