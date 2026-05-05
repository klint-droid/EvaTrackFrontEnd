import API from "../../api";

export const getDisasterTypes = async () => {
    const res = await API.get('/api/disaster-types');
    return res.data;
}