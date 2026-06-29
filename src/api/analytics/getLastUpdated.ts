import API from '../../api';

export const getLastUpdated = async (): Promise<any> => {
  try {
    const response = await API.get('/api/analytics/last-updated');
    return response.data;
  } catch (error) {
    console.error('Error fetching last updated timestamp:', error);
    throw error;
  }
};
