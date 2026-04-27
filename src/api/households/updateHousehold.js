import API from '../../api';

export const updateHousehold = async (id, data) => {
    const res = await API.patch(`/api/households/${id}`, data);
    return res.data;
};