import API from "../../api";

export const getCenter = async (id) => {
    const res = await API.get(`/api/evacuation-centers/${id}`);
    return res.data.data;
};