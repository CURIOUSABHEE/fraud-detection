import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  full_name?: string;
  gender?: string;
  pan_card?: string;
  balance: number;
  latest_login?: string;
  createdAt?: string;
}

export interface SignupData {
  username: string;
  full_name?: string;
  gender?: string;
  pan_card?: string;
  mpin: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, mpin: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('fl_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('fl_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('fl_token');
    if (!storedToken) return;
    try {
      const userData = await api.get<AuthUser>('/users/me', storedToken);
      setUser(userData);
    } catch {
      logout();
    }
  }, [logout]);

  // Rehydrate on mount
  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (username: string, mpin: string) => {
    const data = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
      username,
      mpin,
    });
    localStorage.setItem('fl_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (formData: SignupData) => {
    const data = await api.post<{ token: string; user: AuthUser }>(
      '/auth/register',
      formData
    );
    localStorage.setItem('fl_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
