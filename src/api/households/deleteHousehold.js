import API from '../../api';
export const deleteHousehold = async (id) => {
    const res = await API.delete(`/api/households/${id}`);
    return res.data;
};