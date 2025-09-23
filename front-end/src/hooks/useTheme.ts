import { useState, useEffect, createContext, useContext } from 'react';
import { getUserProfile, updateUserTheme } from '@/lib/api';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useThemeProvider = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user theme preference on mount
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          const profile = await getUserProfile();
          const userTheme = profile.theme; // 1 = light, 0 = dark
          const isDark = !userTheme; // Convert: 1 (light) -> false, 0 (dark) -> true

          setIsDarkMode(isDark);

          // Apply theme to DOM
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('Error loading user theme:', error);
        // Default to light theme if error
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      } finally {
        setLoading(false);
      }
    };

    loadUserTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newDarkMode = !isDarkMode;
      const themeValue = !newDarkMode; // Convert: dark (true) -> 0, light (false) -> 1

      // Update UI immediately
      setIsDarkMode(newDarkMode);

      // Apply theme to DOM
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Update on server
      const token = localStorage.getItem('auth-token');
      if (token) {
        await updateUserTheme(themeValue);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      // Revert on error
      setIsDarkMode(!isDarkMode);
      if (!isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return {
    isDarkMode,
    toggleTheme,
    loading,
  };
};

export { ThemeContext };