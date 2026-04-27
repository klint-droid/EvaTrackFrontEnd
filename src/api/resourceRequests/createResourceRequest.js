import API from '../../api';

export const createResourceRequest = async (payload) => {
  const response = await API.post('/api/resource-requests', payload);
  return response.data;
};