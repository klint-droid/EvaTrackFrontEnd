import API from "../../api";
import type { User } from "../types";

export interface CreateUserPayload {
    first_name: string;
    last_name: string;
    email?: string;
    password?: string;
    role?: 'evac_personnel' | 'evac_admin' | 'super_admin';
    contact_number: string;
}

export interface CreateUserResponse {
    message: string;
    user: User;
}

export const createUser = async (data: CreateUserPayload): Promise<CreateUserResponse> => {
    const response = await API.post<CreateUserResponse>("/api/users", data);
    return response.data;
};
