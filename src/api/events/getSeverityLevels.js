import API from "../../api";

export const getSeverityLevels = async () => {
    const res = await API.get('/api/severity-levels');
    return res.data;
};