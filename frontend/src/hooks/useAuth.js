import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (credentials) => {
      try {
        await login(credentials);
        navigate('/');
        toast.success('Welcome back!');
      } catch (err) {
        const msg = err.response?.data?.message || 'Login failed';
        toast.error(msg);
        throw err;
      }
    },
    [login, navigate]
  );

  const handleRegister = useCallback(
    async (credentials) => {
      try {
        await register(credentials);
        navigate('/');
        toast.success('Account created!');
      } catch (err) {
        const msg = err.response?.data?.message || 'Registration failed';
        toast.error(msg);
        throw err;
      }
    },
    [register, navigate]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out');
  }, [logout, navigate]);

  return { user, isAuthenticated, isLoading, handleLogin, handleRegister, handleLogout };
}
