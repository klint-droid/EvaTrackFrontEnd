import API from "../../api";

export const updateUser = (id, data) =>
  API.put(`/api/users/${id}`, data);