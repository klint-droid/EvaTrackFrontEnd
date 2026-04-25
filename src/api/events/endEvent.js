import API from "../../api";

export const endEvent = async (eventId) => {
    const response = await API.patch(`/api/events/${eventId}/end`);
    return response.data;
};