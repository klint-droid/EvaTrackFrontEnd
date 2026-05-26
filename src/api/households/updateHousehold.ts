import API from '../../api';
import type { Household } from '../types';

export interface UpdateHouseholdPayload {
  household_name?: string;
  contact_number?: string | null;
  barangay?: string | null;
  street?: string | null;
  purok?: string | null;
  city?: string | null;
  province?: string | null;
  full_address?: string | null;
}

export interface UpdateHouseholdResponse {
  message: string;
  data: Household;
}

export const updateHousehold = async (id: string, data: UpdateHouseholdPayload): Promise<UpdateHouseholdResponse> => {
  const res = await API.patch<UpdateHouseholdResponse>(`/api/households/${id}`, data);
  return res.data;
};
