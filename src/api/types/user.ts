export interface User {
    user_id: string;
    first_name: string;
    last_name: string;
    name: string;
    username: string | null;
    email: string | null;
    role_id: number;
    contact_number: string | null;
    assigned_center_id: string | null;
    household_id: string | null;
    is_active: boolean | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}