import API from '../../api';

export const updateCenterIssueReportStatus = async (reportId, status) => {
  const response = await API.patch(`/api/center-issue-reports/${reportId}/status`, {
    status,
  });

  return response.data;
};