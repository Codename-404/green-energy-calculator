import type { Metadata } from "next";
import { articles } from "@/data/articles";
import { LearnHubClient } from "./client";

export const metadata: Metadata = {
  title: "Learning Center",
  description:
    "Educational guides and comparisons about solar panels, batteries, inverters, and wind turbines. Learn everything you need to know before building your green energy system.",
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Learning Center</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          In-depth guides and comparisons to help you make informed decisions
          about your green energy system.
        </p>
      </div>

      {/* Client component handles tabs and rendering */}
      <LearnHubClient articles={articles} />
    </div>
  );
}
