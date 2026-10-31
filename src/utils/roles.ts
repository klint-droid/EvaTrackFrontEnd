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
 * Capability Actions for Open-Closed Principle (OCP) Permission Matrix.
 */
export type PermissionAction =
  | 'units:manage'
  | 'units:create'
  | 'units:edit'
  | 'units:delete'
  | 'allocations:manage'
  | 'evacuees:admit'
  | 'issues:create'
  | 'issues:update_status'
  | 'requests:create'
  | 'alerts:create'
  | 'centers:choose'
  | 'centers:manage'
  | 'users:manage';

/**
 * Single source of truth for Role-Based Capabilities.
 */
const CAPABILITY_MATRIX: Record<UserRole, PermissionAction[]> = {
  super_admin: [
    'units:manage',
    'units:create',
    'units:edit',
    'units:delete',
    'allocations:manage',
    'evacuees:admit',
    'issues:create',
    'issues:update_status',
    'requests:create',
    'alerts:create',
    'centers:choose',
    'centers:manage',
    'users:manage',
  ],
  evac_admin: [
    'units:manage',
    'units:create',
    'units:edit',
    'units:delete',
    'allocations:manage',
    'evacuees:admit',
    'issues:create',
    'issues:update_status',
    'requests:create',
    'alerts:create',
    'centers:choose',
    'centers:manage',
  ],
  evac_personnel: [
    'units:manage',
    'units:create',
    'units:edit',
    'units:delete',
    'allocations:manage',
    'evacuees:admit',
    'issues:create',
    'requests:create',
    'alerts:create',
  ],
};

let activeUserGetter: (() => UserProfile | null) | null = null;

/**
 * Dependency Inversion (DIP): Injects the reactive store accessor.
 */
export const registerUserGetter = (getter: () => UserProfile | null): void => {
  activeUserGetter = getter;
};

/**
 * Retrieve current user from reactive store (or local storage fallback safely).
 */
export const getUser = (): UserProfile | null => {
  if (activeUserGetter) {
    try {
      const fromStore = activeUserGetter();
      if (fromStore) return fromStore;
    } catch {
      // Fall through to localStorage
    }
  }

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

/**
 * Checks whether the current user has permission to perform an action.
 */
export const can = (action: PermissionAction, user?: UserProfile | null): boolean => {
  const targetUser = user !== undefined ? user : getUser();
  if (!targetUser || !targetUser.role) return false;
  const allowed = CAPABILITY_MATRIX[targetUser.role] || [];
  return allowed.includes(action);
};

export const isSuperAdmin = (): boolean => getUser()?.role === 'super_admin';
export const isAdmin = (): boolean => getUser()?.role === 'evac_admin';
export const isPersonnel = (): boolean => getUser()?.role === 'evac_personnel';

export const getAssignedCenterId = (): string | null => {
  const user = getUser();
  return user?.assigned_center_id || user?.assigned_center?.id || null;
};
