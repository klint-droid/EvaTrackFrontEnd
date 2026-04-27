import API from '../../api';

export const getCenterIssueReports = async (params = {}) => {
  const response = await API.get('/api/center-issue-reports', { params });
  return response.data;
};