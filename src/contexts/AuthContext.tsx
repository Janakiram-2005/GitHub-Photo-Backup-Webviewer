import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  phone: string;
  email: string;
  pin: string; // Used as password/pin
  secretQuestion: string;
  secretAnswer: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pin: string) => Promise<boolean>;
  logout: () => void;
  register: (user: Omit<User, 'id'>) => Promise<boolean>;
  resetPassword: (email: string, answer: string, newPin: string) => Promise<boolean>;
  getSecretQuestion: (email: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'photo-sync-session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load active session from local storage on mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        setUser(JSON.parse(storedSession));
      }
    } catch (e) {
      console.error('Error loading session', e);
    }
  }, []);

  // Update session when active user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = async (email: string, pin: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return true;
      }
    } catch (e) {
      console.error('Login error', e);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (newUser: Omit<User, 'id'>) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return true;
      }
    } catch (e) {
      console.error('Register error', e);
    }
    return false;
  };

  const getSecretQuestion = async (email: string) => {
    try {
      const res = await fetch('/api/get-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        return data.question;
      }
    } catch (e) {
      console.error('Get question error', e);
    }
    return null;
  };

  const resetPassword = async (email: string, answer: string, newPin: string) => {
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answer, newPin })
      });
      const data = await res.json();
      return data.success === true;
    } catch (e) {
      console.error('Reset password error', e);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, resetPassword, getSecretQuestion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
