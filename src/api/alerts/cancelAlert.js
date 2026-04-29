import API from '../../api';
export const cancelAlert = async (id) => {
    const res = await API.delete(`/api/notifications/${id}`);
    return res.data;
};