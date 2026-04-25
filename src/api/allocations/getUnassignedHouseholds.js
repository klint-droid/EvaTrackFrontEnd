import API from '../../api';

export const getUnassignedHouseholds = async (centerId) => {
    const response = await API.get(`/api/centers/${centerId}/unassigned`);
    return response.data;
};