import API from "../../api";

export const searchHousehold = async (query) => {
  const res = await API.get(`/evacuations/search-household?query=${query}`);
  return res.data.data;
};