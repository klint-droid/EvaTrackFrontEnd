import API from "../../api";

export const logout = async () => {
  return await API.post("/logout");
};