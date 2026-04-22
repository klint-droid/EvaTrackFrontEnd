import API from "../../api";

export const assignCenter = (userId, centerId) =>
  API.post(`/api/users/${userId}/assign-center`, {
    assigned_center_id: centerId,
  });