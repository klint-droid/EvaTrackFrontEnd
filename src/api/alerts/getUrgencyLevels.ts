import API from '../../api';
import type { UrgencyLevel } from '../types';

export interface UrgencyLevelsResponse {
    data: UrgencyLevel[];
}

export const getUrgencyLevels = async (): Promise<UrgencyLevelsResponse> => {
    const res = await API.get<UrgencyLevelsResponse>('/api/urgency-levels');
    return res.data;
};
