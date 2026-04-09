export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "admin";
};

export const isSuperAdmin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "super_admin";
};

