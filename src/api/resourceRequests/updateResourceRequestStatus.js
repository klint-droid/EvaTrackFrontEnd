import API from '../../api';

export const updateResourceRequestStatus = async (requestId, status) => {
  const response = await API.patch(`/api/resource-requests/${requestId}/status`, {
    status,
  });

  return response.data;
};