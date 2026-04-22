import API from "../../api";

export const scanQR = async (household_id) => {
    const res = await API.post("/api/evacuations/process-scan", {
    household_id,
    });
    return res.data;
}