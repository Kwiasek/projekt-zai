import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  _hasHydrated: boolean;
}


interface AuthActions {
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export type AuthStore = AuthState & AuthActions

export const defaultInitState: AuthState = {
  user: null,
  accessToken: null,
  _hasHydrated: false
}

export const createAuthStore = (
  initState: AuthState = defaultInitState
) => {
  return createStore<AuthStore>()(
    persist(
      (set) => ({
        ...initState,
        setAuth: (user, accessToken) => set({ user, accessToken }),
        clearAuth: () => set({ user: null, accessToken: null }),
        setHasHydrated: (state) => set({ _hasHydrated: state })
      }),
      {
        name: 'auth-storage',
        onRehydrateStorage: (state) => {
          return () => state.setHasHydrated(true)
        }
      }
    )
  )
}
