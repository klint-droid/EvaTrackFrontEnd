import API from "../../api";

export const getUnitAllocations = async (unitId) => {
    const response = await API.get(`/api/units/${unitId}/allocations`);
    return response.data;
}