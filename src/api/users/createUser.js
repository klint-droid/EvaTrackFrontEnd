import API from "../../api";

export const createUser = (data) =>
  API.post("/api/users", data);