import API from '../../api';
import type { ResourceRequest } from '../types';

export interface GetResourceRequestsParams {
    center_id?: string;
    status?: 'pending' | 'acknowledged' | 'approved' | 'rejected' | 'delivered';
    urgency_id?: string | number;
    q?: string;
}

export interface GetResourceRequestsSummary {
    pending: number;
    acknowledged: number;
    approved: number;
    rejected: number;
    delivered_24h: number;
}

export interface GetResourceRequestsResponse {
    data: ResourceRequest[];
    summary: GetResourceRequestsSummary;
}

export const getResourceRequests = async (
    params: GetResourceRequestsParams = {}
): Promise<GetResourceRequestsResponse> => {
    const response = await API.get<GetResourceRequestsResponse>('/api/resource-requests', { params });
    return response.data;
};
