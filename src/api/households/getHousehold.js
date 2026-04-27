import API from '../../api';

export const getHousehold = async (id) => {
    const res = await API.get(`/api/households/${id}`);
    return res.data;
};