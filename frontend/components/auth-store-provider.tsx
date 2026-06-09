'use client'

import { AuthStore, createAuthStore } from "@/lib/authStore"
import { createContext, ReactNode, useContext, useState } from "react"
import { useStore } from "zustand"

export type AuthStoreApi = ReturnType<typeof createAuthStore>

export const AuthStoreContext = createContext<AuthStoreApi | undefined>(
  undefined
)

export interface AuthStoreProviderProps {
  children: ReactNode
}

export const AuthStoreProvider = ({
  children
}: AuthStoreProviderProps) => {
  const [store] = useState(() => createAuthStore())
  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  )
}

export const useAuthStore = <T = AuthStore,>(
  selector: (store: AuthStore) => T = (state) => state as unknown as T,
): T => {
  const authStoreContext = useContext(AuthStoreContext)
  if (!authStoreContext) {
    throw new Error(`useAuthStore must be used within AuthStoreProvider`)
  }

  return useStore(authStoreContext, selector)
}