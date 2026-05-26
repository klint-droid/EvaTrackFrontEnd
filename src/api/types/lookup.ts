export interface LookupItem {
    id: number;
    label: string;
}

export interface LookupsResponse {
    genders: LookupItem[];
    relationships: LookupItem[];
    civil_status: LookupItem[];
    vulnerable_groups: LookupItem[];
}