import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { theme } from '../utils/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const deviceTheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceTheme === 'dark');

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const currentTheme = isDark ? theme.dark : theme.light;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 