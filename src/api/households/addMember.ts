import API from '../../api';
import type { HouseholdMember } from '../types';

// Payload structure matching backend request validation rules
export interface AddMemberPayload {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  gender_id?: number | null;
  relationship_id?: number | null;
  civil_status_id?: number | null;
  vulnerable_group_ids?: number[]; // list of lookup IDs
}

// Laravel response payload structure
export interface AddMemberResponse {
  message: string;
  data: HouseholdMember;
}

export const addMember = async (
  householdId: string, 
  data: AddMemberPayload
): Promise<AddMemberResponse> => {
  const res = await API.post<AddMemberResponse>(`/api/households/${householdId}/members`, data);
  return res.data;
};
