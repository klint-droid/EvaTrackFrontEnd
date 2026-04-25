import API from "../../api";

export const createUnit = async (centerId, data) => {
    const response = await API.post(`/api/centers/${centerId}/units`, data);
    return response.data;
}