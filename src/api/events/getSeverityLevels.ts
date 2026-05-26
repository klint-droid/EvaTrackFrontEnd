import API from "../../api";

import type { SeverityLevel } from "../types";

export interface GetSeverityLevelsResponse {
    data: SeverityLevel[];
}

export const getSeverityLevels = async (): Promise<GetSeverityLevelsResponse> => {
    const res = await API.get<GetSeverityLevelsResponse>("/api/severity-levels");

    return res.data;
}