import API from '../../api';

export const deleteRecord = async (evacuationId) => {
    const response = await API.delete(`/api/evacuations/${evacuationId}`);
    return response.data;
};