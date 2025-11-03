import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Side } from '@/types';

export const themes = {
  coffee: {
    primary: "#6b4226",
    accent: "#c89f8d",
    background: "#faf3ef",
    name: "coffee"
  },
  tea: {
    primary: "#2e7d32",
    accent: "#a5d6a7",
    background: "#f1f8e9",
    name: "tea"
  },
};

interface ThemeContextType {
  theme: typeof themes.coffee | typeof themes.tea;
  setTheme: (side: Side) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<typeof themes.coffee | typeof themes.tea>(themes.coffee);

  const setTheme = (side: Side) => {
    setThemeState(themes[side]);
    // Save to localStorage
    localStorage.setItem('brewbook_theme', side);
    // Apply CSS variables
    document.documentElement.style.setProperty('--theme-primary', themes[side].primary);
    document.documentElement.style.setProperty('--theme-accent', themes[side].accent);
    document.documentElement.style.setProperty('--theme-background', themes[side].background);
  };

  useEffect(() => {
    // Initialize with saved theme or coffee theme by default
    const savedTheme = localStorage.getItem('brewbook_theme') as Side | null;
    if (savedTheme && (savedTheme === 'coffee' || savedTheme === 'tea')) {
      setTheme(savedTheme);
    } else {
      setTheme('coffee');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

