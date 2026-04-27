import API from '../../api';

export const deleteResourceRequest = async (requestId) => {
  const response = await API.delete(`/api/resource-requests/${requestId}`);
  return response.data;
};