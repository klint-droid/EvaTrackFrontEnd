import API from "../../api";

export const getEvents = async () => {
    const response = await API.get("/api/events");
    return response.data;
}