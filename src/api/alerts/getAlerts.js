import API from '../../api';
export const getAlerts = async (page = 1) => {
    const res = await API.get(`/api/notifications?page=${page}`);
    return res.data;
};