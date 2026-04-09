import API from "../../api";

export const deleteCenter = async (centerId) => {
    return await API.delete(`/api/evacuation-centers/${centerId}`);
};
