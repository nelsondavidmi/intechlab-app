"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { IdTokenResult, User } from "firebase/auth";
import { onAuthStateChanged, signOut, getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  token: IdTokenResult | null;
  signOutUser: () => Promise<void>;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<IdTokenResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setIsFirebaseReady(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        const idToken = await getIdTokenResult(nextUser, true).catch(
          () => null,
        );
        setToken(idToken);
      } else {
        setToken(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOutUser = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isFirebaseReady,
      isAdmin: Boolean(token?.claims?.role === "admin"),
      signOutUser,
    }),
    [loading, signOutUser, token, user, isFirebaseReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
