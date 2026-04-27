import API from '../../api';
export const getMembers = async (householdId) => {
    const res = await API.get(`/api/households/${householdId}/members`);
    return res.data;
};