import API from "../../api";
import type { PaginatedResponse, Household } from "../types";

export const searchHousehold = async (
  q: string,
  type: 'household' | 'member' | 'all' = 'household'
): Promise<PaginatedResponse<Household>> => {
  const res = await API.get<PaginatedResponse<Household>>('/api/evacuations/search-household', { 
    params: { q, type } 
  });
  return res.data;
};
