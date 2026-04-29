import API from '../../api';
export const getAlertDetail = async (id) => {
    const res = await API.get(`/api/notifications/${id}`);
    return res.data;
};