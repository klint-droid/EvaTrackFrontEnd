import API from "../../api";

export const deleteRoom = async (roomId) => {
  return await API.delete(`/rooms/${roomId}`);
};