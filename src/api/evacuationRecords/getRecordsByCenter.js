import API from '../../api';

export const getRecordsByCenter = async (centerId) => {
    const response = await API.get('/api/evacuations', {
        params: {
            center_id: centerId,
            status: 'evacuated',
        },
    });

    return response.data;
};