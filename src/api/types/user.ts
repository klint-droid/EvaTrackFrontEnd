/**
 * User domain interfaces matching backend UserResource contract.
 * Adheres to Liskov Substitution Principle (LSP).
 */

export type UserRole = 'super_admin' | 'evac_admin' | 'evac_personnel';

export interface AssignedCenterSummary {
    id: string;
    name: string;
}

export interface User {
    user_id: string;
    first_name: string;
    last_name: string;
    name: string;
    username?: string | null;
    email: string | null;
    role_id: number;
    role: UserRole;
    role_label: string;
    contact_number: string | null;
    assigned_center_id: string | null;
    assigned_center?: AssignedCenterSummary | null;
    household_id?: string | null;
    profile_photo_url?: string | null;
    is_active?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}