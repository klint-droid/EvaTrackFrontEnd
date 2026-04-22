import API from "../../api";

export const createHousehold = async (household_name, count) => {
  const res = await API.post("/api/households", {
    household_name,
    member_count: parseInt(count) || 1,
  });

  return res.data;
};