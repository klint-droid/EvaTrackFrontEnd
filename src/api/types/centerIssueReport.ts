import type { User } from './user';
import type { Center } from './evacuationCenter';

export interface CenterIssueReport {
    report_id: string;
    evacuation_center_id: string;
    reported_by: string;
    handled_by: string | null;
    category_id: number;
    title: string;
    description: string;
    severity_id: number;
    status_id: number;
    created_at: string;
    updated_at: string;

    // Flattened & formatted attributes appended by the backend controller:
    status: 'open' | 'in_progress' | 'resolved' | 'closed' | null;
    category: 'incident' | 'facility_issue' | 'health_issue' | 'safety_issue' | 'other' | null;
    severity: 'low' | 'medium' | 'high' | 'critical' | null;
    status_label: string | null;
    category_label: string | null;
    severity_label: string | null;
    reported_by_user: User | null;
    handled_by_user: User | null;
    center?: Center | null;
}
