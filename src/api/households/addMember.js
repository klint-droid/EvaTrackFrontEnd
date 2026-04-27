import API from '../../api';
export const addMember = async (householdId, data) => {
    const res = await API.post(`/api/households/${householdId}/members`, data);
    return res.data;
};