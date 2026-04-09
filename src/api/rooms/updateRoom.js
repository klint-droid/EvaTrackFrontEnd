import API from "../../api";

export const updateRoom = async (roomId, data) => {
  return await API.put(`/api/rooms/${roomId}`, data);
};