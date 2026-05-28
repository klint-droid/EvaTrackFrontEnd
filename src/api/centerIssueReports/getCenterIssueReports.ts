import API from '../../api';
import type { CenterIssueReport } from '../types';

export interface GetCenterIssueReportsParams {
    center_id?: string;
    category?: 'incident' | 'facility_issue' | 'health_issue' | 'safety_issue' | 'other';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    q?: string;
}

export interface GetCenterIssueReportsSummary {
    open: number;
    in_progress: number;
    resolved: number;
    critical: number;
}

export interface GetCenterIssueReportsResponse {
    data: CenterIssueReport[];
    summary: GetCenterIssueReportsSummary;
}

export const getCenterIssueReports = async (
    params: GetCenterIssueReportsParams = {}
): Promise<GetCenterIssueReportsResponse> => {
    const response = await API.get<GetCenterIssueReportsResponse>('/api/center-issue-reports', { params });
    return response.data;
};
