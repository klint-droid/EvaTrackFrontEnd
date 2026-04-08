import API from "../../api";

export const verifyManual = async (household_id) => {
  const res = await API.post("/evacuations/verify-manual", {
    household_id,
  });
  return res.data;
};