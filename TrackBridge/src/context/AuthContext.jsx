import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Mock authentication context.
//
// This simulates the JWT + refresh-token session described in the product
// spec: signIn()/register() resolve a "session", we persist it, and every
// protected route reads `user.role` to decide what to render. Swap the
// three functions below for real POST /auth/* calls when the backend auth
// service exists — the shape of `user` (id, role, name, email) is the
// contract the rest of the app depends on, so keep that stable.

const AuthContext = createContext(null);
const STORAGE_KEY = "trackbridge.session";
const TRIAL_DAYS = 30;

// New company accounts start on a 30-day free trial. `planStatus` moves
// trial -> active (once a payment method is added) or trial -> expired
// (once trialEndsAt passes with no payment method). There is deliberately
// only one paid plan — no tiers — matching the product's pricing model.
function seedCompanyBilling() {
  return {
    planStatus: "trial",
    trialEndsAt: Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
    plan: null,
    paymentMethod: null,
    invoices: [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      // Mock "sign in" — in production this posts to /auth/login and
      // stores the returned access + refresh tokens instead of a plain object.
      signIn: async ({ role, email }) => {
        const session = {
          id: `${role}-${Date.now()}`,
          role, // "customer" | "company" | "driver"
          name: role === "company" ? "Your Company" : "Your Name",
          email,
          ...(role === "company" ? seedCompanyBilling() : {}),
        };
        setUser(session);
        return session;
      },
      register: async ({ role, name, email, extra }) => {
        const session = {
          id: `${role}-${Date.now()}`,
          role,
          name: name || (role === "company" ? "Your Company" : "Your Name"),
          email,
          ...(role === "company" ? seedCompanyBilling() : {}),
          ...extra,
        };
        setUser(session);
        return session;
      },
      // Merges a partial billing update into the current session — used by
      // the Billing page to simulate subscribing, canceling, or (for demo
      // purposes) fast-forwarding the trial.
      updateBilling: (patch) => setUser((u) => (u ? { ...u, ...patch } : u)),
      signOut: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
