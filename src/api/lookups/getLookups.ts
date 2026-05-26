import API from "../../api";
import type { LookupsResponse } from "../types";

export const getLookups = async (): Promise<LookupsResponse> => {
    const res = await API.get<LookupsResponse>("/api/lookups");
    return res.data;
}