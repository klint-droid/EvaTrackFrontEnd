import API from "../../api";

export const createEvent = async ({name, type}) => {
    const response = await API.post("/api/events", {name, type});
    return response.data;
}