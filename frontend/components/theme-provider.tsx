"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (!win.__themeConsolePatched) {
    win.__themeConsolePatched = true;
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Encountered a script tag while rendering React component")
      ) {
        return;
      }
      origError.apply(console, args);
    };
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
