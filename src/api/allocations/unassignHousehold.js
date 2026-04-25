import API from '../../api';

export const unassignHousehold = async (unitId, allocationId) => {
    const response = await API.delete(`/api/units/${unitId}/allocations/${allocationId}`);
    return response.data;
};