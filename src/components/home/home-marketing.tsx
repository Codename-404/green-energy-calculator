import Link from "next/link";
import { ArrowRight, BookOpen, MapPin, Battery, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stats = [
  { value: "50+", label: "Equipment reviewed" },
  { value: "2", label: "Energy calculators" },
  { value: "78+", label: "Regions supported" },
  { value: "25yr", label: "ROI projections" },
];

export function HomeMarketing() {
  return (
    <div className="space-y-16">
      {/* Stats */}
      <section>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted-foreground">
            Three simple steps to plan your green energy system.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">1. Set your location</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your address or use GPS. We fetch solar irradiance and wind
              data from NASA and Open-Meteo for your exact location.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Battery className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">2. Choose equipment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse our curated database of solar panels, wind turbines,
              batteries, and inverters. Compare specs side by side.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BarChart3 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">3. See your results</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get detailed energy production estimates, monthly breakdowns,
              savings projections, and environmental impact metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Learn CTA */}
      <section>
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">
              New to green energy?
            </h2>
            <p className="max-w-lg text-muted-foreground">
              Explore our learning center with in-depth guides on solar panel
              types, battery chemistry, wind turbines, and more. Make informed
              decisions with expert knowledge.
            </p>
            <Link
              href="/learn"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "gap-2",
              )}
            >
              <BookOpen className="h-5 w-5" />
              Browse Learning Center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
