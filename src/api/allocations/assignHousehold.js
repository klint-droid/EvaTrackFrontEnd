import API from "../../api";

export const assignHousehold = async (unitId, evacuationId) => {
    const response = await API.post(`/api/units/${unitId}/allocations`, { 
        evacuation_id: evacuationId 
    });
    return response.data;
}