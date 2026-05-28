import API from '../../api';
import type { UrgencyLevel } from '../types';

export interface GetUrgencyLevelsResponse {
    data: UrgencyLevel[];
}

export const getUrgencyLevels = async (): Promise<GetUrgencyLevelsResponse> => {
    const response = await API.get<GetUrgencyLevelsResponse>('/api/urgency-levels');
    return response.data;
};
