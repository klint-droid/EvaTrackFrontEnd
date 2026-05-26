export interface Gender {
    gender_id: number;
    gender_key: string;
    gender_label: string;
}

export interface Relationship {
    relationship_id: number;
    relationship_key: string;
    relationship_label: string;
}

export interface CivilStatus {
    status_id: number;
    status_key: string;
    status_label: string;
}

export interface VulnerableGroup {
    group_id: number;
    group_key: string;
    group_label: string;
}

export interface HouseholdMember {
    member_id: string;
    household_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    birth_date: string;
    gender_id: number | null;
    relationship_id: number | null;
    civil_status_id: number | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;

    gender?: Gender;
    relationship?: Relationship;
    civil_status?: CivilStatus;
    vulnerable_groups?: VulnerableGroup[];
}