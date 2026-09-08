"use client";

import * as React from "react";
import { STORAGE_KEY } from "@/lib/theme/init-script";

type Palette = "commerce" | "luxury";
type Theme = "light" | "dark";

interface ThemeState {
  palette: Palette;
  theme: Theme;
}

interface ThemeProviderContext extends ThemeState {
  setPalette: (p: Palette) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  togglePalette: () => void;
}

const ThemeContext = React.createContext<ThemeProviderContext | null>(null);

function applyTheme(palette: Palette, theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-palette", palette);
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ThemeState>({ palette: "commerce", theme: "light" });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ThemeState>;
        const next: ThemeState = {
          palette: parsed.palette === "luxury" ? "luxury" : "commerce",
          theme: parsed.theme === "dark" ? "dark" : "light",
        };
        // Hydrate the persisted preference after localStorage becomes available.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(next);
        applyTheme(next.palette, next.theme);
      } else {
        // default
        applyTheme("commerce", "light");
      }
    } catch {
      applyTheme("commerce", "light");
    }
    setMounted(true);
  }, []);

  const persist = React.useCallback((next: ThemeState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    applyTheme(next.palette, next.theme);
  }, []);

  const setPalette = React.useCallback(
    (p: Palette) => {
      setState((prev) => {
        const next = { ...prev, palette: p };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setTheme = React.useCallback(
    (t: Theme) => {
      setState((prev) => {
        const next = { ...prev, theme: t };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const toggleTheme = React.useCallback(() => {
    setState((prev) => {
      const next = { ...prev, theme: prev.theme === "dark" ? "light" : "dark" };
      persist(next);
      return next;
    });
  }, [persist]);

  const togglePalette = React.useCallback(() => {
    setState((prev) => {
      const next = { ...prev, palette: prev.palette === "commerce" ? "luxury" : "commerce" };
      persist(next);
      return next;
    });
  }, [persist]);

  const value = React.useMemo<ThemeProviderContext>(
    () => ({ ...state, setPalette, setTheme, toggleTheme, togglePalette }),
    [state, setPalette, setTheme, toggleTheme, togglePalette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    // safe fallback for SSR / outside provider
    return {
      palette: "commerce" as Palette,
      theme: "light" as Theme,
      setPalette: () => {},
      setTheme: () => {},
      toggleTheme: () => {},
      togglePalette: () => {},
    };
  }
  return ctx;
}
