import API from "../../api";

import type { DisasterEvent } from "../types";

export interface GetEventsResponse {
    data: DisasterEvent[];
}

export const getEvents = async (): Promise<GetEventsResponse> => {
    const res = await API.get<GetEventsResponse>("/api/disaster-events");

    return res.data;
}