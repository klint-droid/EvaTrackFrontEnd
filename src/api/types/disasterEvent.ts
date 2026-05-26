import type { Center } from "./evacuationCenter";

export interface DisasterType{
    type_id: number;
    type_code: string;
    type_name: string;
    is_active: boolean | number;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

export interface SeverityLevel {
    severity_id: number;
    severity_key: string;
    severity_label: string;
}

export interface DisasterEvent {
    event_id: string;
    name: string;
    type_id: number;
    severity_level_id: number;
    started_at: string;
    ended_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;

    primary_type?: DisasterType;
    severity?: SeverityLevel;
    types?: DisasterType[];
    evacuation_centers?: Center[];
}