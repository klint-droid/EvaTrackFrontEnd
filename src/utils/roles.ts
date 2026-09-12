import type { User, UserRole, AssignedCenterSummary } from '../api/types/user';

export type { UserRole, AssignedCenterSummary };

export interface UserProfile extends User {
  // Backwards compatibility optional fields
  role: UserRole;
  token?: string;
}

/**
 * Standardizes incoming role data from API/storage into canonical UserRole.
 * Adheres to Liskov Substitution Principle (LSP).
 */
export const normalizeRole = (
  roleData: unknown,
  roleId?: number | string
): UserRole => {
  const roleObj = typeof roleData === 'object' && roleData !== null
    ? (roleData as Record<string, unknown>)
    : null;

  const rawKey = (roleObj?.role_key || roleData || '').toString().toLowerCase().trim();
  const id = Number(roleId || roleObj?.role_id);

  if (id === 1 || rawKey === 'super_admin') return 'super_admin';
  if (id === 2 || rawKey === 'evac_admin') return 'evac_admin';
  if (id === 3 || rawKey === 'evac_personnel') return 'evac_personnel';

  return 'evac_personnel'; // Safe default
};

/**
 * Retrieve current user from local storage safely.
 */
export const getUser = (): UserProfile | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const parsed = JSON.parse(userStr);
    if (parsed) {
      parsed.role = normalizeRole(parsed.role, parsed.role_id);
    }
    return parsed as UserProfile;
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    return null;
  }
};

export const isSuperAdmin = (): boolean => getUser()?.role === 'super_admin';
export const isAdmin = (): boolean => getUser()?.role === 'evac_admin';
export const isPersonnel = (): boolean => getUser()?.role === 'evac_personnel';

export const getAssignedCenterId = (): string | null => {
  const user = getUser();
  return user?.assigned_center_id || user?.assigned_center?.id || null;
};
