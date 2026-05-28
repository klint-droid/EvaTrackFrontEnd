import type { User } from './user';
import type { Center } from './evacuationCenter';
import type { UrgencyLevel } from './urgencyLevel';

export interface ResourceRequestStatus {
    status_id: number;
    status_key: 'pending' | 'acknowledged' | 'approved' | 'rejected' | 'delivered';
    status_label: string;
}

export interface ResourceRequest {
    request_id: string;
    evacuation_center_id: string;
    requested_by: string;
    handled_by: string | null;
    resource_type: string;
    quantity: number;
    description: string | null;
    urgency_id: number;
    status_id: number;
    created_at: string;
    updated_at: string;

    // Eager loaded relations:
    center?: Center;
    requester?: User;
    handler?: User | null;
    urgency_level?: UrgencyLevel;
    status?: ResourceRequestStatus;
}
