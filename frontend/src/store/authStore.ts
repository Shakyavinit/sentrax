import { create } from 'zustand';
import { User } from '../types';
import { DEMO_MODE } from '../utils/demo';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('sentrax_token');
  const savedUser = localStorage.getItem('sentrax_user');

  const isDemo = DEMO_MODE;
  const initialToken = savedToken || (isDemo ? 'demo-sentrax-token-offline' : null);
  const initialUser = savedUser
    ? JSON.parse(savedUser)
    : (isDemo ? { id: 'demo-officer', username: 'Demo Officer', email: 'officer@sentrax.gov.in', role: 'admin', is_active: true } : null);

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
    setAuth: (user, token) => {
      localStorage.setItem('sentrax_token', token);
      localStorage.setItem('sentrax_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('sentrax_token');
      localStorage.removeItem('sentrax_user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});

