import API from "../../api";

export const unassignCenter = async (centerId) => {
    const response = await API.patch(`/api/centers/${centerId}/unassign`);
    return response.data;
}