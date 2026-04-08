import API from "../../api";

export const createHousehold = async (household_name) => {
  const res = await api.post("/evacuations/create-household", {
    household_name: household_name,
  });
  return res.data;
};