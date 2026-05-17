import API from "../../api";
import type { Center } from "../types/evacuationCenter";

export const getCenter = async (id: number | string ): Promise<Center> => {
  const res = await API.get(`/api/evacuation-centers/${id}`);
  return res.data.data;
};