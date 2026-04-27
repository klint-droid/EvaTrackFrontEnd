import API from '../../api';

export const updateCenterIssueReport = async (reportId, payload) => {
  const response = await API.patch(`/api/center-issue-reports/${reportId}`, payload);
  return response.data;
};