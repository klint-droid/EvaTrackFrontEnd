export interface UserProfile {
  role: 'super_admin' | 'evac_admin' | 'evac_personnel';
  assigned_center_id?: string | null;
  assigned_center?: {
    id: string;
    name: string;
  } | null;
  [key: string]: any;
}

export const getUser = (): UserProfile | null => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? (JSON.parse(userStr) as UserProfile) : null;
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    return null;
  }
};

export const isSuperAdmin = (): boolean => {
  const user = getUser();
  return user?.role === "super_admin";
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === "evac_admin"; 
};

export const isPersonnel = (): boolean => {
  const user = getUser();
  return user?.role === "evac_personnel";
};

export const getAssignedCenterId = (): string | null => {
  const user = getUser();
  return user?.assigned_center_id || user?.assigned_center?.id || null;
};
