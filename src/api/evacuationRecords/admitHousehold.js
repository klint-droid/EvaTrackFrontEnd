import API from "../../api";

export const admitHousehold = async (household_id, count) => {
  const res = await API.post("/api/evacuations/admit", {
    household_id,
    member_count: parseInt(count) || 1,
  });

  return res.data;
};