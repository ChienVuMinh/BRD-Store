import { create } from 'zustand';

interface AuthState {
  token: string | null;
  username: string | null;
  roles: string[];
  partnerId: string | null;
  setAuth: (token: string, username: string, roles: string[], partnerId: string | null) => void;
  clearAuth: () => void;
  hasAnyRole: (roles: string[]) => boolean;
}

const STORAGE_KEY = 'partner_portal_auth';

interface Persisted {
  token: string | null;
  username: string | null;
  roles: string[];
  partnerId: string | null;
}

function loadInitial(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, username: null, roles: [], partnerId: null };
    return JSON.parse(raw);
  } catch {
    return { token: null, username: null, roles: [], partnerId: null };
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadInitial(),
  setAuth: (token, username, roles, partnerId) => {
    const data: Persisted = { token, username, roles, partnerId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    set(data);
  },
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, username: null, roles: [], partnerId: null });
  },
  hasAnyRole: (roles) => {
    const current = get().roles;
    return roles.some((r) => current.includes(r));
  },
}));
