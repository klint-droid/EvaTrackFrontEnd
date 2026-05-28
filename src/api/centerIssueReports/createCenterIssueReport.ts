import API from '../../api';
import type { CenterIssueReport } from '../types';

export interface CreateCenterIssueReportPayload {
    evacuation_center_id?: string | null;
    category: 'incident' | 'facility_issue' | 'health_issue' | 'safety_issue' | 'other';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CreateCenterIssueReportResponse {
    message: string;
    data: CenterIssueReport;
}

export const createCenterIssueReport = async (
    payload: CreateCenterIssueReportPayload
): Promise<CreateCenterIssueReportResponse> => {
    const response = await API.post<CreateCenterIssueReportResponse>('/api/center-issue-reports', payload);
    return response.data;
};
