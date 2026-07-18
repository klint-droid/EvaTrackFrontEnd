import { create } from 'zustand';
import { getUser } from '../api/auth/getUser';
import { UserProfile } from '../utils/roles';

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
      return stored ? (JSON.parse(stored) as UserProfile) : null;
    } catch {
      return null;
    }
  })(),
  loading: false,

  setUser: (user) => {
    if (user) {
      const normalizedUser: UserProfile = {
        ...user,
        role: (user.role?.role_key || user.role) as any,
        role_label: user.role?.role_name || user.role_label,
        assigned_center: user.assigned_center ? {
          id: user.assigned_center.evacuation_center_id || user.assigned_center.id,
          name: user.assigned_center.name,
        } : (user.assigned_center_id ? { id: user.assigned_center_id, name: '' } : null),
      };
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
      const res = await getUser();
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
