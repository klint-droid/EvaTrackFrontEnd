import API from '../../api';

export const createCenterIssueReport = async (payload) => {
  const response = await API.post('/api/center-issue-reports', payload);
  return response.data;
};