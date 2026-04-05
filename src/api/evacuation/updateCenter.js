import API from "../../api";

export const updateCenter = async (centerId, centerData) => {
    return await API.put(`/api/evacuation-centers/${centerId}`, centerData);
};
