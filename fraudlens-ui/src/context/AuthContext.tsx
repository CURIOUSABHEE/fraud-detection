import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface AuthUser {
  id: string;
  username: string;
  full_name?: string;
  gender?: string;
  pan_card?: string;
  balance: number;
  latest_login?: string;
  createdAt?: string;
  isAdmin?: boolean;
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
  isAuthenticated: boolean;
  login: (username: string, mpin: string) => Promise<AuthUser>;
  signup: (data: SignupData) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('fl_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    localStorage.removeItem('fl_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('fl_token');
    
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      if (!res.ok) {
        throw new Error('Invalid token');
      }
      
      const userData = await res.json();
      setUser(userData);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, mpin: string): Promise<AuthUser> => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, mpin }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid credentials');
      }
      
      const data = await res.json();
      localStorage.setItem('fl_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Invalid credentials. Please try again.');
    }
  };

  const signup = async (formData: SignupData): Promise<AuthUser> => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Signup failed');
      }
      
      const data = await res.json();
      localStorage.setItem('fl_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Signup failed. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
