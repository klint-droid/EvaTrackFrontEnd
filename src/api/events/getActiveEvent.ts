import API from "../../api";

import type { DisasterEvent } from "../types";

export interface GetActiveEventResponse {
    message: string;
    data: DisasterEvent;
}

export const getActiveEvent = async (): Promise<GetActiveEventResponse> => {
    const res = await API.get<GetActiveEventResponse>("/api/events/active")

    return res.data;
}