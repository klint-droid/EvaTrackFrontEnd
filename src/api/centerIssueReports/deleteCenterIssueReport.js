import API from '../../api';

export const deleteCenterIssueReport = async (reportId) => {
  const response = await API.delete(`/api/center-issue-reports/${reportId}`);
  return response.data;
};