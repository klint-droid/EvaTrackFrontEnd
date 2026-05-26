import API from "../../api";

import type { DisasterType } from "../types";

export interface GetDisasterTypesResponse {
    data: DisasterType[];
}

export const getDisasterTypes = async (): Promise<GetDisasterTypesResponse> => {
    const res = await API.get<GetDisasterTypesResponse>("/api/disaster-types")

    return res.data
}