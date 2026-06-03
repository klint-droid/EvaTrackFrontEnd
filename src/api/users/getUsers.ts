import API from "../../api";
import type { User, PaginatedResponse } from "../types";

export type GetUsersResponse = PaginatedResponse<User>;

export const getUsers = async (
    page: number = 1,
    search?: string,
    role?: string
): Promise<GetUsersResponse> => {
    let url = `/api/users?page=${page}`;
    if (search) url += `&q=${encodeURIComponent(search)}`;
    if (role) url += `&role=${encodeURIComponent(role)}`;
    
    const response = await API.get<GetUsersResponse>(url);
    return response.data;
};
