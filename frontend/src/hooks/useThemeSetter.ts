import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useTheme } from '@/context/ThemeContext';

// Hook to automatically set theme based on user's side
export const useThemeSetter = () => {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (user?.side) {
      setTheme(user.side);
    }
  }, [user?.side, setTheme]);
};

