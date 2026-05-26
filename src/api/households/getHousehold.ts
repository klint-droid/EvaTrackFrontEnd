import API from "../../api";
import type { Household } from "../types";

export interface GetHouseholdResponse {
    data: Household;

}

export const getHousehold = async (id: string): Promise<GetHouseholdResponse> => {
    const res = await API.get<GetHouseholdResponse>(`/api/households/${id}`);
    return res.data;
}