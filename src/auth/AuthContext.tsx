import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { authApi } from "../api/auth";
import { tokenStore } from "./token-store";

type AuthContextValue = {
  authenticated: boolean;
  ready: boolean;
  login(values: { email: string; password: string }): Promise<void>;
  signup(values: { name: string; email: string; password: string }): Promise<void>;
  logout(): void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [authenticated, setAuthenticated] = useState(Boolean(tokenStore.getAccess()));
  const [ready, setReady] = useState(false);
  const logout = useCallback(() => { tokenStore.clear(); setAuthenticated(false); }, []);

  useEffect(() => {
    const refresh = tokenStore.getRefresh();
    if (!refresh) { setReady(true); return; }
    authApi.refresh(refresh).then((tokens) => { tokenStore.set(tokens); setAuthenticated(true); }).catch(logout).finally(() => setReady(true));
    window.addEventListener("albo:logout", logout);
    return () => window.removeEventListener("albo:logout", logout);
  }, [logout]);

  const value = useMemo(() => ({
    authenticated, ready,
    login: async (values: { email: string; password: string }) => { tokenStore.set(await authApi.login(values)); setAuthenticated(true); },
    signup: async (values: { name: string; email: string; password: string }) => { tokenStore.set(await authApi.signup(values)); setAuthenticated(true); },
    logout,
  }), [authenticated, ready, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
