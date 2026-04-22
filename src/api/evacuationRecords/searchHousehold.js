import API from "../../api";

export const searchHousehold = async (query) => {
  const res = await API.get(`/api/evacuations/search-household?q=${query}`);
  return res.data;
};