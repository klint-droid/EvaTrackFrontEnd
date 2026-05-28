import API from '../../api';
import type { ResourceRequest } from '../types';

export interface CreateResourceRequestPayload {
    evacuation_center_id?: string | null;
    resource_type: string;
    quantity: number;
    description?: string | null;
    urgency_id: number | string;
}

export interface CreateResourceRequestResponse {
    message: string;
    data: ResourceRequest;
}

export const createResourceRequest = async (
    payload: CreateResourceRequestPayload
): Promise<CreateResourceRequestResponse> => {
    const response = await API.post<CreateResourceRequestResponse>('/api/resource-requests', payload);
    return response.data;
};
