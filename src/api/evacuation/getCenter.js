import API from "../../api";

export const getCenter = async (id) => {
    return await API.get(`/api/evacuation-centers/${id}`);
};
