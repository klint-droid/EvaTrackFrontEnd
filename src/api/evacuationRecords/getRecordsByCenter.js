import API from '../../api';

export const getRecordsByCenter = async (centerId) => {
    const response = await API.get(`/api/evacuation-records?center_id=${centerId}`);
    return response.data;
};