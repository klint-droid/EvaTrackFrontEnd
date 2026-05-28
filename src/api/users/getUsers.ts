import API from "../../api";
import type { User, PaginatedResponse } from "../types";

export type GetUsersResponse = PaginatedResponse<User>;

export const getUsers = async (): Promise<GetUsersResponse> => {
    const response = await API.get<GetUsersResponse>("/api/users");
    return response.data;
};
