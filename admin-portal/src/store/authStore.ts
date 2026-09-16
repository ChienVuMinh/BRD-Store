import { create } from 'zustand';

interface AuthState {
  token: string | null;
  username: string | null;
  roles: string[];
  setAuth: (token: string, username: string, roles: string[]) => void;
  clearAuth: () => void;
  hasAnyRole: (roles: string[]) => boolean;
}

const STORAGE_KEY = 'admin_portal_auth';

function loadInitial(): { token: string | null; username: string | null; roles: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, username: null, roles: [] };
    return JSON.parse(raw);
  } catch {
    return { token: null, username: null, roles: [] };
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadInitial(),
  setAuth: (token, username, roles) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, username, roles }));
    set({ token, username, roles });
  },
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, username: null, roles: [] });
  },
  hasAnyRole: (roles) => {
    const current = get().roles;
    return roles.some((r) => current.includes(r));
  },
}));
