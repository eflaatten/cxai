import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import darkTheme from "./themes/dark";
import lightTheme from "./themes/light";

const STORAGE_KEY = "cxai-theme";
const FALLBACK_THEME = "system";
const themeRegistry = {
  dark: darkTheme,
  light: lightTheme,
};

const ThemeContext = createContext(null);

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return FALLBACK_THEME;
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return ["light", "dark", "system"].includes(storedTheme)
    ? storedTheme
    : FALLBACK_THEME;
};

const flattenThemeVariables = (tokens, prefix = []) =>
  Object.entries(tokens).reduce((variables, [key, value]) => {
    const nextPrefix = [...prefix, key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)];

    if (value && typeof value === "object") {
      return {
        ...variables,
        ...flattenThemeVariables(value, nextPrefix),
      };
    }

    return {
      ...variables,
      [`--${nextPrefix.join("-")}`]: value,
    };
  }, {});

export function ThemeProvider({ children }) {
  const [selectedTheme, setSelectedTheme] = useState(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const resolvedTheme = selectedTheme === "system" ? systemTheme : selectedTheme;
  const activeTheme = themeRegistry[resolvedTheme] ?? lightTheme;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    handleChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, selectedTheme);
    }
  }, [selectedTheme]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const cssVariables = flattenThemeVariables(activeTheme.tokens);

    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;

    Object.entries(cssVariables).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });

    root.style.setProperty("--color-primary-font", activeTheme.tokens.text.primary);
  }, [activeTheme, resolvedTheme]);

  const value = {
    selectedTheme,
    resolvedTheme,
    setTheme: setSelectedTheme,
    theme: activeTheme.tokens,
    isDark: resolvedTheme === "dark",
    themeOptions: [
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" },
      { label: "System", value: "system" },
    ],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
};
