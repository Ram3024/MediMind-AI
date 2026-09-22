"use client";

/**
 * Providers component - wraps the app with theme, session, and state providers
 */

import { useState, useEffect, createContext, useContext } from "react";
import { SessionProvider } from "next-auth/react";

// Theme context
type Theme = "dark" | "light";
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("medimind-theme") as Theme;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("medimind-theme", next);
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "light" ? "light" : ""} style={{ minHeight: "100vh" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
