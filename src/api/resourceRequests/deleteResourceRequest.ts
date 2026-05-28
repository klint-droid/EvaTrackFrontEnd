import API from '../../api';

export interface DeleteResourceRequestResponse {
    message: string;
}

export const deleteResourceRequest = async (requestId: string): Promise<DeleteResourceRequestResponse> => {
    const response = await API.delete<DeleteResourceRequestResponse>(`/api/resource-requests/${requestId}`);
    return response.data;
};
