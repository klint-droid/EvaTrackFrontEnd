import type { Household } from './household';
import type { HouseholdMember } from './householdMember';
import type { Center } from './evacuationCenter';
import type { DisasterEvent } from './disasterEvent';
import type { User } from './user';

/**
 * Represents the accommodation type (e.g., Family Room, Cubicle, Tent).
 */
export interface UnitType {
  type_id: number;
  type_key: string;
  type_label: string;
}

/**
 * Represents an actual room, tent, or space inside an evacuation center.
 */
export interface Unit {
  unit_id: number;
  center_id: string;
  name: string;
  type_id: number;
  max_capacity: number;
  current_occupancy: number;
  
  // Optional eager-loaded lookup:
  type?: UnitType;
}

/**
 * Represents the allocation mapping linking an evacuation record to a unit.
 */
export interface UnitAllocation {
  allocation_id: number;
  evacuation_id: number | string;
  unit_id: number;
  assigned_by: string | null;
  selected_by_resident: boolean | null;
  created_at: string | null;
  
  // Relations:
  unit?: Unit;
}

/**
 * Maps individual household members that have been checked into the evacuation center.
 */
export interface EvacuatedMember {
  evacuation_id: number | string;
  member_id: string;
  verified_at: string | null;
  
  // Eager-loaded profile:
  member?: HouseholdMember;
}

/**
 * The master log representing a household check-in at an evacuation center.
 */
export interface EvacuationRecord {
  evacuation_id: number | string;
  event_id: string | null;
  household_id: string;
  center_id: string;
  household_status_id: number; // 1 = Not Evacuated/Not Verified, 2 = Evacuated
  evacuated_count: number;
  method: 'qr' | 'manual';
  verified_by: string;
  verified_at: string;
  created_at: string | null;
  updated_at: string | null;

  // Eager-loaded relations:
  household?: Household;
  evacuated_members?: EvacuatedMember[];
  unit_allocation?: UnitAllocation | null;
  center?: Center;
  event?: DisasterEvent | null;
  verifier?: User;
}
