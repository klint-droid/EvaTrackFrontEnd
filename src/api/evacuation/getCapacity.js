import API from "../../api";

export const getCapacity = async (centerId) => {
  return await API.get(`/api/evacuation-centers/${centerId}/capacity`);
};