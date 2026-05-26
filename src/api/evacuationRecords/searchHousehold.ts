import API from "../../api";
import type { PaginatedResponse, Household } from "../types";

export const searchHousehold = async (q: string): Promise<PaginatedResponse<Household>> => {
  const res = await API.get<PaginatedResponse<Household>>('/api/evacuations/search-household', { 
    params: { q } 
  });
  return res.data;
};
