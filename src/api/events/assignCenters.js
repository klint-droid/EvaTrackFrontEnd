import API from "../../api";

export const assignCenters = async (eventId, centerId) => {
    const response = await API.patch(`/api/events/${eventId}/assign-centers`, {center_id: centerId});
    return response.data;
}