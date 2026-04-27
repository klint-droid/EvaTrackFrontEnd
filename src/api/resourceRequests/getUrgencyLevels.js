import API from '../../api';

export const getUrgencyLevels = async () => {
  const response = await API.get('/api/urgency-levels');
  return response.data;
};