import API from "../../api";

export const getUnitsByCenter = async (centerId) => {
    const response = await API.get(`/api/centers/${centerId}/units`);
    return response.data;
}