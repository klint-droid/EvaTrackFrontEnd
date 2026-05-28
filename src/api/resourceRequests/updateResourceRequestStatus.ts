import API from '../../api';
import type { ResourceRequest } from '../types';

export interface UpdateResourceRequestStatusResponse {
    message: string;
    data: ResourceRequest;
}

export const updateResourceRequestStatus = async (
    requestId: string,
    status: 'pending' | 'acknowledged' | 'approved' | 'rejected' | 'delivered'
): Promise<UpdateResourceRequestStatusResponse> => {
    const response = await API.patch<UpdateResourceRequestStatusResponse>(`/api/resource-requests/${requestId}/status`, {
        status,
    });
    return response.data;
};
