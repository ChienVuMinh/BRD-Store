import { create } from 'zustand';

interface AuthState {
  token: string | null;
  accountId: string | null;
  consumerId: string | null;
  setAuth: (token: string, accountId: string, consumerId: string) => void;
  clearAuth: () => void;
}

const STORAGE_KEY = 'consumer_store_auth';

interface Persisted {
  token: string | null;
  accountId: string | null;
  consumerId: string | null;
}

function loadInitial(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, accountId: null, consumerId: null };
    return JSON.parse(raw);
  } catch {
    return { token: null, accountId: null, consumerId: null };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitial(),
  setAuth: (token, accountId, consumerId) => {
    const data: Persisted = { token, accountId, consumerId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    set(data);
  },
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, accountId: null, consumerId: null });
  },
}));
