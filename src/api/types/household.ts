import type { HouseholdMember } from "./householdMember";

export interface Address {
    address_id: number;
    barangay: string | null;
    purok: string | null;
    city: string | null;
    province: string | null;
    full_address: string | null;
}

export interface Household {
  household_id: string;
  household_code: string | null;
  household_name: string;
  address_id: number | null;
  contact_number: string | null;
  emergency_contact: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  address?: Address;
  members?: HouseholdMember[];
  members_count?: number;
}
