import API from "../../api";

export const updateProfile = async (formData: FormData): Promise<any> => {
    formData.append("_method", "PUT");
    return await API.post("/api/user/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
