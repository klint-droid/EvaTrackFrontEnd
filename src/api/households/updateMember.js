import API from '../../api';
export const updateMember = async (householdId, memberId, data) => {
    const res = await API.patch(`/api/households/${householdId}/members/${memberId}`, data);
    return res.data;
};