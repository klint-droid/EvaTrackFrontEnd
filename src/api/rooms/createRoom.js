import API from "../../api";

export const createRoom = (data) => {
  return API.post(`/api/rooms`, data);
};