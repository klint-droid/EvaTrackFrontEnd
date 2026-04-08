import API from "../../api";

export const getUser = async () => {
  return await API.get("/api/user");
};