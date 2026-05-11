import Link from "next/link";
import { Info } from "lucide-react";

/**
 * Short transparency disclaimer shown under every calculator's results.
 * Links to the full methodology article in /learn for curious users.
 *
 * Accuracy numbers come from real SCADA validation in scripts/validate/.
 */
export function MethodologyNotice() {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-md border border-muted-foreground/15 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <p className="leading-relaxed">
        Modeled estimates based on long-term NASA POWER climate data. Typical
        accuracy is within ±10-15% of real-world output.{" "}
        <Link
          href="/learn/guides/how-we-calculate"
          className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
        >
          How we calculate &rarr;
        </Link>
      </p>
    </div>
  );
}
