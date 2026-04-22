import API from "../../api";

export const suggestRoom = (centerId, members) =>
  API.get("/api/rooms/suggest", {
    params: {
      evacuation_center_id: centerId,
      members: members
    }
  });