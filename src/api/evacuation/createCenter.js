import API from "../../api";

export const createCenter = async (centerData) => {
    return await API.post("/api/evacuation-centers", centerData);
};
