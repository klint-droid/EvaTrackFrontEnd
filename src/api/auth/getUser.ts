import API from "../../api";

export const getUser = async (): Promise<any> => {
    return await API.get("/api/user");
};