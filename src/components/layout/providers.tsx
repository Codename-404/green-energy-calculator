"use client";

import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

// Suppress React 19 false-positive warning about next-themes injecting a <script> tag.
// The script runs correctly during SSR — this is a dev-only cosmetic warning.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}
