import API from '../../api';

export const getHouseholds = async (page = 1, params = {}) => {
    const query = new URLSearchParams({ page, ...params }).toString();
    const res = await API.get(`/api/households?${query}`);
    return res.data;
};