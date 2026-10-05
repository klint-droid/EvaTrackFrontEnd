import { create } from 'zustand';
import { getUser as fetchApiUser } from '../api/auth/getUser';
import { UserProfile, UserRole, normalizeRole } from '../utils/roles';

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: any) => void;
  fetchFreshUser: () => Promise<void>;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isPersonnel: () => boolean;
  getAssignedCenterId: () => string | null;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed) {
        parsed.role = normalizeRole(parsed.role, parsed.role_id);
      }
      return parsed as UserProfile;
    } catch {
      return null;
    }
  })(),
  loading: false,

  setUser: (user: any) => {
    if (user) {
      const u = user as any;
      const normalizedRole: UserRole = normalizeRole(
        u.role?.role_key || u.role,
        u.role_id || u.role?.role_id
      );

      const normalizedUser = {
        ...u,
        role: normalizedRole,
        role_label: u.role?.role_name || u.role_label || (
          normalizedRole === 'super_admin' ? 'Super Admin' :
          normalizedRole === 'evac_admin' ? 'Evacuation Admin' :
          'Evacuation Personnel'
        ),
        assigned_center: u.assigned_center ? {
          id: u.assigned_center.evacuation_center_id || u.assigned_center.id,
          name: u.assigned_center.name,
        } : (u.assigned_center_id ? { id: u.assigned_center_id, name: '' } : null),
      } as UserProfile;
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      set({ user: normalizedUser });
    } else {
      localStorage.removeItem("user");
      set({ user: null });
    }
  },

  fetchFreshUser: async () => {
    set({ loading: true });
    try {
      const res = await fetchApiUser();
      const body = res.data?.data || res.data || res;
      const freshUser = body.data || body;
      if (freshUser) {
        get().setUser(freshUser);
      }
    } catch (err) {
      console.error("Failed to sync fresh user data", err);
    } finally {
      set({ loading: false });
    }
  },

  isSuperAdmin: () => get().user?.role === 'super_admin',
  isAdmin: () => get().user?.role === 'evac_admin',
  isPersonnel: () => get().user?.role === 'evac_personnel',
  getAssignedCenterId: () => get().user?.assigned_center?.id || get().user?.assigned_center_id || null,
}));
