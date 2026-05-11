"use client";

import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}
