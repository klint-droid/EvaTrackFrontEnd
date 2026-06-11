import API from "../../api";

export interface UpdatePasswordParams {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export const updatePassword = async (params: UpdatePasswordParams): Promise<any> => {
    // Note: Laravel expects 'new_password_confirmation' when using 'confirmed' validation on 'new_password'
    return await API.put("/api/user/password", params);
};
