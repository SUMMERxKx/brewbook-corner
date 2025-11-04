import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Side } from '@/types';

// Coffee theme colors (brown/tan palette)
const coffeeTheme = {
  // Background colors
  background: '32 25% 97%',
  foreground: '25 35% 15%',
  card: '0 0% 100%',
  cardForeground: '25 35% 15%',
  popover: '0 0% 100%',
  popoverForeground: '25 35% 15%',
  
  // Primary colors (brown)
  primary: '25 50% 35%',
  primaryForeground: '32 25% 97%',
  
  // Secondary colors (warm tan)
  secondary: '35 40% 90%',
  secondaryForeground: '25 35% 15%',
  
  // Muted colors
  muted: '35 30% 94%',
  mutedForeground: '25 20% 45%',
  
  // Accent (coffee brown)
  accent: '25 60% 40%',
  accentForeground: '0 0% 100%',
  
  // Destructive
  destructive: '0 84% 60%',
  destructiveForeground: '0 0% 100%',
  
  // Border/Input
  border: '35 20% 88%',
  input: '35 20% 88%',
  ring: '25 50% 35%',
  
  // Side-specific colors
  coffee: '25 60% 40%',
  coffeeLight: '30 50% 85%',
  coffeeForeground: '0 0% 100%',
  
  tea: '95 35% 50%',
  teaLight: '95 35% 85%',
  teaForeground: '0 0% 100%',
};

// Tea theme colors (green/pastel palette)
const teaTheme = {
  // Background colors (pastel green)
  background: '95 35% 97%',
  foreground: '95 40% 15%',
  card: '0 0% 100%',
  cardForeground: '95 40% 15%',
  popover: '0 0% 100%',
  popoverForeground: '95 40% 15%',
  
  // Primary colors (green)
  primary: '95 40% 35%',
  primaryForeground: '95 35% 97%',
  
  // Secondary colors (light green)
  secondary: '95 45% 90%',
  secondaryForeground: '95 40% 15%',
  
  // Muted colors
  muted: '95 30% 94%',
  mutedForeground: '95 25% 45%',
  
  // Accent (tea green)
  accent: '95 40% 45%',
  accentForeground: '0 0% 100%',
  
  // Destructive
  destructive: '0 84% 60%',
  destructiveForeground: '0 0% 100%',
  
  // Border/Input
  border: '95 25% 88%',
  input: '95 25% 88%',
  ring: '95 40% 35%',
  
  // Side-specific colors
  coffee: '25 60% 40%',
  coffeeLight: '30 50% 85%',
  coffeeForeground: '0 0% 100%',
  
  tea: '95 40% 45%',
  teaLight: '95 35% 85%',
  teaForeground: '0 0% 100%',
};

interface ThemeContextType {
  currentSide: Side | null;
  themeName: 'coffee' | 'tea';
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
  const { user } = useAuth();
  
  // Determine current side from user or default to coffee
  const currentSide: Side | null = user?.side || null;
  const themeName: 'coffee' | 'tea' = currentSide === 'tea' ? 'tea' : 'coffee';
  
  // Apply theme CSS variables based on user's side
  useEffect(() => {
    const theme = currentSide === 'tea' ? teaTheme : coffeeTheme;
    
    // Apply all CSS variables
    Object.entries(theme).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      document.documentElement.style.setProperty(cssVarName, value);
    });
  }, [currentSide]);

  return (
    <ThemeContext.Provider value={{ currentSide, themeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

