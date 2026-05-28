import API from "../../api";
import type { UnitType } from "../types";

export interface GetAccommodationTypesResponse {
    data: UnitType[];
}

export const getAccommodationTypes = async (): Promise<GetAccommodationTypesResponse> => {
    const response = await API.get<GetAccommodationTypesResponse>(`/api/accommodation-types`);
    return response.data;
};
