import API from '../../api';
import type { HouseholdMember } from '../types';

// The update fields mirror the AddMember request validation in the backend
export interface UpdateMemberPayload {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  gender_id?: number | null;
  relationship_id?: number | null;
  civil_status_id?: number | null;
  vulnerable_group_ids?: number[];
}

export interface UpdateMemberResponse {
  message: string;
  data: HouseholdMember;
}

export const updateMember = async (householdId: string, memberId: string, data: UpdateMemberPayload): Promise<UpdateMemberResponse> => {
  const res = await API.patch<UpdateMemberResponse>(`/api/households/${householdId}/members/${memberId}`, data);
  return res.data;
};
