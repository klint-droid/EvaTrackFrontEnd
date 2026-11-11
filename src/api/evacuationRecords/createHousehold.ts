import API from "../../api";
import type { Household } from "../types";

export interface CreateMemberPayload {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  birth_date: string;
  gender_id?: number | string | null;
  gender?: string | null;
  sex?: string | null;
  relationship_id?: number | string | null;
  relation?: string | null;
  civil_status_id?: number | string | null;
  civil_status?: string | null;
  is_household_head?: boolean | number;
  can_report_for_household?: boolean | number;
  is_pwd?: boolean | number;
  is_pregnant?: boolean | number;
  vulnerable_group_ids?: number[];
  contact_number?: string | null;
}

export interface CreateHouseholdPayload {
  household_name: string;
  contact_number?: string | null;
  emergency_contact?: string | null;
  address_id?: number | null;
  barangay?: string | null;
  street?: string | null;
  purok?: string | null;
  city?: string | null;
  province?: string | null;
  full_address?: string | null;
  members?: CreateMemberPayload[];
}

export interface CreateHouseholdResponse {
  message: string;
  data: Household;
}

export const createHousehold = async (data: CreateHouseholdPayload): Promise<CreateHouseholdResponse> => {
  const res = await API.post<CreateHouseholdResponse>('/api/households', data);
  return res.data;
};
