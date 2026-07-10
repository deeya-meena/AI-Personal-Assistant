"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, resolvedTheme, setTheme, systemTheme } = useNextTheme();

  // Ensure theme resolves correctly even on the first render before mounting to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Toggle using the resolved theme to handle system mode correctly
    const activeTheme = resolvedTheme || theme || "dark";
    setTheme(activeTheme === "dark" ? "light" : "dark");
  };

  const currentActiveTheme = mounted ? (resolvedTheme || theme || "dark") : "dark";

  return {
    theme: currentActiveTheme as "light" | "dark",
    setTheme,
    systemTheme,
    toggleTheme,
  };
}
