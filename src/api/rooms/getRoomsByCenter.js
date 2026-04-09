import API from "../../api";

export const getRoomsByCenter = (centerId) => {
  return API.get(`/api/evacuation-centers/${centerId}/rooms`);
};