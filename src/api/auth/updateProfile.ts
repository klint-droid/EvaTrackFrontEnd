import API from "../../api";

export interface UpdateProfileParams {
    first_name: string;
    last_name: string;
    contact_number: string;
}

export const updateProfile = async (params: UpdateProfileParams): Promise<any> => {
    return await API.put("/api/user/profile", params);
};
