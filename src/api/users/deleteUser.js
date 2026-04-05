import API from "../../api";

export const deleteUser = (userId) => {
  return API.delete(`/api/users/${userId}`);
};