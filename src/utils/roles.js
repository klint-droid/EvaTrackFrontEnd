export const isSuperAdmin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "super_admin";
};

export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "evac_admin"; 
};

export const isPersonnel = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "evac_personnel";
};