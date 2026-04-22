import API from "../../api";

export const assignRoom = async (roomId, payload) => {
  return await API.post(`/api/rooms/${roomId}/assignments`, payload);
};