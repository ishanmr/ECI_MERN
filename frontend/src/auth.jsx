import { createContext, useContext, useMemo, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eci-session')) || null; } catch { return null; }
  });
  async function authenticate(path, values) {
    const result = await api(path, { method: 'POST', body: JSON.stringify(values), auth: false });
    const next = { token: result.token, user: result.user };
    localStorage.setItem('eci-session', JSON.stringify(next));
    setSession(next);
    return next;
  }
  const value = useMemo(() => ({
    user: session?.user || null,
    login: (values) => authenticate('/auth/login', values),
    register: (values, staff = false) => authenticate(staff ? '/auth/register-staff' : '/auth/register', values),
    logout: () => { localStorage.removeItem('eci-session'); setSession(null); }
  }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
