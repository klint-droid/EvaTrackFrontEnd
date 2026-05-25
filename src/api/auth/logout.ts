import API from "../../api";

export const logout = async (): Promise<void> => {
    await API.post("/logout");
};