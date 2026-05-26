import API from "../../api";

import type { DisasterEvent } from "../types";

export interface EndEventResponse {
    message: string;
    data: DisasterEvent;
}

export const endEvent = async (id: string): Promise<EndEventResponse> => {
    const res = await API.patch<EndEventResponse>(`/api/events/${id}/end`);

    return res.data;
}