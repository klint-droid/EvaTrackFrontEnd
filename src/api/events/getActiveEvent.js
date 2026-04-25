import API from "../../api";

export const getActiveEvent = async () => {
    const response = await API.get("/api/events/active");
    return response.data;
}