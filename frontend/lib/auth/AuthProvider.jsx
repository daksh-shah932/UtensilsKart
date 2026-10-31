"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { axiosClient, setAccessToken } from "@/lib/api/axiosClient";

export const AuthContext = createContext(null);

/**
 * Custom JWT-based AuthProvider — no Firebase Auth SDK.
 *
 * - accessToken lives in module memory (axiosClient) and context state
 * - refreshToken is an httpOnly cookie managed by the browser/backend
 * - On mount, attempts a silent /api/auth/refresh to restore session
 */
export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Sign in: called after OTP verify returns accessToken + user
  const signIn = useCallback((accessToken, userData) => {
    setAccessToken(accessToken);
    setUser(userData);
  }, []);

  // ── Sign out: clear token + call logout endpoint (clears refresh cookie)
  const logout = useCallback(async () => {
    try {
      await axiosClient.post("/api/auth/logout");
    } catch {
      // Ignore errors — clear local state regardless
    }
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  // ── On mount: try to silently refresh session using the httpOnly refresh cookie
  useEffect(() => {
    async function tryRestoreSession() {
      try {
        console.log("[Auth] Attempting to restore session...");
        const response = await axiosClient.post("/api/auth/refresh");
        
        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken);
          // Decode user info from the JWT payload (middle segment, base64)
          const payload = JSON.parse(
            atob(response.data.accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
          );
          setUser({ uid: payload.uid, role: payload.role, identifier: "" });
          console.log("[Auth] Session restored successfully for user:", payload.uid);
        } else {
          throw new Error("No access token in response");
        }
      } catch (err) {
        // No valid refresh cookie — user is not logged in, that's fine
        console.log("[Auth] No active session found (this is normal if not logged in)");
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    tryRestoreSession();
  }, []);

  // ── Listen for auth:logout events from the axios 401 interceptor
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
