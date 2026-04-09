import API from "../../api";

export const getCenters = async () => {
    return await API.get("/api/evacuation-centers");
};
