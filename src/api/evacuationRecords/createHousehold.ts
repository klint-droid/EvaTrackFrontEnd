import API from "../../api";
import type { Household } from "../types";

export interface CreateHouseholdPayload {
  household_name: string;
  contact_number?: string | null;
  address_id?: number | null;
}

export interface CreateHouseholdResponse {
  message: string;
  data: Household;
}

export const createHousehold = async (data: CreateHouseholdPayload): Promise<CreateHouseholdResponse> => {
  const res = await API.post<CreateHouseholdResponse>('/api/households', data);
  return res.data;
};
