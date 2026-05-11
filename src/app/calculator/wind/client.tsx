"use client";

import { useUrlSync } from "@/hooks/use-url-sync";
import { useLocationHydration } from "@/hooks/use-location-hydration";
import { LocationInput } from "@/components/calculator/location-input";
import { WindParametersForm } from "@/components/calculator/wind-parameters-form";
import { WindResults } from "@/components/calculator/wind-results";
import { WindMonthlyChart } from "@/components/calculator/wind-monthly-chart";
import { WeatherDisplay } from "@/components/calculator/weather-display";
import { SavingsSummary } from "@/components/calculator/savings-summary";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Wind, Settings } from "lucide-react";

export function WindCalculatorClient() {
  const { isHydrated, urlLat, urlLng } = useUrlSync("wind");
  useLocationHydration(urlLat, urlLng, isHydrated);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page header */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10">
            <Wind className="size-5 text-sky-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Wind Energy Calculator
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Estimate your wind energy production based on location, turbine
              specifications, hub height, and terrain conditions.
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
                <Wind className="size-4 text-sky-500" />
                Location
              </CardTitle>
              <CardDescription>
                Set your location to fetch wind speed data from NASA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationInput />
            </CardContent>
          </Card>

          {/* Weather display (compact, below location) */}
          <WeatherDisplay />

          {/* Turbine & System Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="size-4 text-muted-foreground" />
                Turbine & System Parameters
              </CardTitle>
              <CardDescription>
                Select your wind turbine and configure installation parameters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WindParametersForm />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Results */}
        <div className="space-y-6">
          {/* Wind Results */}
          <WindResults />

          {/* Monthly Chart */}
          <WindMonthlyChart />

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
