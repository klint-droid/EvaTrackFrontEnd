import API from '../../api';

export const getEvacuationRecord = async (evacuationId) => {
    const response = await API.get(`/api/evacuations/${evacuationId}`);
    return response.data;
};