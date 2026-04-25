import API from "../../api";

export const deleteUnit = async (centerId, unitId) => {
    const response = await API.delete(`/api/centers/${centerId}/units/${unitId}`);
    return response.data;
}