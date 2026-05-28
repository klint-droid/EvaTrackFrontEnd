import API from '../../api';
import type { CenterIssueReport } from '../types';

export interface UpdateCenterIssueReportPayload {
    category?: 'incident' | 'facility_issue' | 'health_issue' | 'safety_issue' | 'other';
    title?: string;
    description?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdateCenterIssueReportResponse {
    message: string;
    data: CenterIssueReport;
}

export const updateCenterIssueReport = async (
    reportId: string,
    payload: UpdateCenterIssueReportPayload
): Promise<UpdateCenterIssueReportResponse> => {
    const response = await API.patch<UpdateCenterIssueReportResponse>(`/api/center-issue-reports/${reportId}`, payload);
    return response.data;
};
