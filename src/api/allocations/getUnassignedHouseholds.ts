import API from '../../api';
import type { EvacuationRecord } from '../types';

export interface GetUnassignedHouseholdsResponse {
    data: EvacuationRecord[];
}

export const getUnassignedHouseholds = async (centerId: string): Promise<GetUnassignedHouseholdsResponse> => {
    const response = await API.get<GetUnassignedHouseholdsResponse>(`/api/centers/${centerId}/unassigned`);
    return response.data;
};
