import API from "../../api";

import type { DisasterEvent } from "../types";

export interface AssignCentersResponse {
    message: string;
    data: DisasterEvent;
}

export const assignCenters = async (eventId: string, centerIds: string[]): Promise<AssignCentersResponse> => {
    const res = await API.patch<AssignCentersResponse>(`/api/events/${eventId}/assign-centers`, { center_id: centerIds });

    return res.data;
}