import API from '../../api';

export interface DeleteCenterIssueReportResponse {
    message: string;
}

export const deleteCenterIssueReport = async (reportId: string): Promise<DeleteCenterIssueReportResponse> => {
    const response = await API.delete<DeleteCenterIssueReportResponse>(`/api/center-issue-reports/${reportId}`);
    return response.data;
};
