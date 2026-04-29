import API from '../../api';
export const getUrgencyLevels = async () => {
    const res = await API.get('/api/urgency-levels');
    return res.data;
};