"use client";

import { useEffect } from "react";
import { initEquipmentData } from "@/store/derived";
import { useUrlSync } from "@/hooks/use-url-sync";
import { useLocationHydration } from "@/hooks/use-location-hydration";
import { LocationInput } from "@/components/calculator/location-input";
import { SolarParametersForm } from "@/components/calculator/solar-parameters-form";
import { CalculationResults } from "@/components/calculator/calculation-results";
import { MonthlyChart } from "@/components/calculator/monthly-chart";
import { WeatherDisplay } from "@/components/calculator/weather-display";
import { SavingsSummary } from "@/components/calculator/savings-summary";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sun, Settings } from "lucide-react";

export function SolarCalculatorClient() {
  const { isHydrated, urlLat, urlLng } = useUrlSync("solar");
  useLocationHydration(urlLat, urlLng, isHydrated);

  /** Initialize equipment data on mount so derived atoms can access panel data */
  useEffect(() => {
    initEquipmentData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page header */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
            <Sun className="size-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Solar Energy Calculator
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Estimate your solar energy production based on location, panel
              specifications, and system parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr]">
        {/* Left column: Form inputs */}
        <div className="space-y-6">
          {/* Location Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sun className="size-4 text-amber-500" />
                Location
              </CardTitle>
              <CardDescription>
                Set your location to fetch solar irradiance data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationInput />
            </CardContent>
          </Card>

          {/* Weather display (compact, below location) */}
          <WeatherDisplay />

          {/* System Parameters Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="size-4 text-muted-foreground" />
                System Parameters
              </CardTitle>
              <CardDescription>
                Configure your solar panel system specifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SolarParametersForm />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Results */}
        <div className="space-y-6">
          {/* Calculation Results */}
          <Card>
            <CardContent className="pt-4">
              <CalculationResults />
            </CardContent>
          </Card>

          {/* Monthly Chart */}
          <MonthlyChart />

          {/* Savings Summary */}
          <Card>
            <CardContent className="pt-4">
              <SavingsSummary />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
