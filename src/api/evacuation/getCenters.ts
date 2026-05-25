import API from "../../api";
import type { Center } from "../types/evacuationCenter";

export const getCenters = async (): Promise<Center[]> => {
  const response = await API.get("/api/evacuation-centers");

  return response.data;
};