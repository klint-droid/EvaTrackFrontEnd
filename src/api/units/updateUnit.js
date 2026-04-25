import API from "../../api";

export const updateUnit = async (centerId, unitId, data) => {
    const response = await API.put(`/api/centers/${centerId}/units/${unitId}`, data);
    return response.data;
}