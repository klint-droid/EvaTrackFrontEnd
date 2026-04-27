import API from '../../api';
export const deleteMember = async (householdId, memberId) => {
    const res = await API.delete(`/api/households/${householdId}/members/${memberId}`);
    return res.data;
};