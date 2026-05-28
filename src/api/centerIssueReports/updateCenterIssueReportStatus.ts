import API from '../../api';
import type { CenterIssueReport } from '../types';

export interface UpdateCenterIssueReportStatusResponse {
    message: string;
    data: CenterIssueReport;
}

export const updateCenterIssueReportStatus = async (
    reportId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
): Promise<UpdateCenterIssueReportStatusResponse> => {
    const response = await API.patch<UpdateCenterIssueReportStatusResponse>(`/api/center-issue-reports/${reportId}/status`, {
        status,
    });
    return response.data;
};
