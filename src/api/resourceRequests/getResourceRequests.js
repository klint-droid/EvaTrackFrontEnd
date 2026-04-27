import API from '../../api';

export const getResourceRequests = async (params = {}) => {
  const response = await API.get('/api/resource-requests', { params });
  return response.data;
};