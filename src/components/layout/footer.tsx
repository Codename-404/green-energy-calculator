import Link from "next/link";
import { Sun } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Sun className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">
                Green<span className="text-primary">Calc</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Calculate your green energy potential. Make informed decisions
              about solar panels and wind turbines.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Calculators</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/calculator/solar" className="hover:text-primary transition-colors">
                  Solar Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculator/wind" className="hover:text-primary transition-colors">
                  Wind Calculator
                </Link>
              </li>
              <li>
                <Link href="/system-builder" className="hover:text-primary transition-colors">
                  System Builder
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/equipment" className="hover:text-primary transition-colors">
                  Equipment Database
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-primary transition-colors">
                  Learning Center
                </Link>
              </li>
              <li>
                <Link href="/learn/glossary" className="hover:text-primary transition-colors">
                  Glossary
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About GreenCalc
                </Link>
              </li>
              <li>
                <Link href="/learn/guides/understanding-roi" className="hover:text-primary transition-colors">
                  How We Calculate
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            Data sourced from NASA POWER and Open-Meteo. Calculations based on NREL PVWatts methodology.
            Results are estimates and may vary from actual performance.
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GreenCalc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
