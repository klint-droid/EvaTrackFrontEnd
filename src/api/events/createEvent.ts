import API from "../../api";

import type { DisasterEvent } from "../types";

export interface CreateEventPayload {
    name: string;
    type_id: number;
    severity_id: number;
}

export interface CreateEventResponse {
    message: string;
    data: DisasterEvent;
}

export const createEvent = async (data: CreateEventPayload): Promise<CreateEventResponse> => {
    const res = await API.post<CreateEventResponse>('/api/events', data);

    return res.data;
}