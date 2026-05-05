import API from "../../api";

export const createEvent = async (form) => {
    const response = await API.post("/api/events", {
        name: form.name,
        type_id: form.type_id,
        severity_id: form.severity_id
    });
    return response.data;
}