import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LOCAL_STORAGE_KEY = 'appTheme';

interface Theme {
  language: string;
  activeColumns: string[];
}

interface ThemeContextType {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState({ language: 'en', activeColumns: [] });
  const { i18n } = useTranslation();

  const updateTheme = (params) => {
    setTheme((state) => ({ ...state, ...params }));
    if (params.language) i18n.changeLanguage(params.language);
  };

  const value: ThemeContextType = {
    theme,
    updateTheme
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTheme) updateTheme(JSON.parse(storedTheme));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext - ThemeContext');
  }
  return context;
};
