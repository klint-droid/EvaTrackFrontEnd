import API from "../../api";

export const getAccommodationTypes = async () => {
    const response = await API.get(`/api/accommodation-types`);
    return response.data;
};