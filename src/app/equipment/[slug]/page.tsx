import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import solarPanels from "@/data/solar-panels.json";
import batteries from "@/data/batteries.json";
import windTurbines from "@/data/wind-turbines.json";
import inverters from "@/data/inverters.json";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatPower,
  formatPercent,
  formatCurrency,
  formatWindSpeed,
  formatArea,
} from "@/lib/formatters";
import {
  ArrowLeft,
  Star,
  Shield,
  Weight,
  Ruler,
  Zap,
  Gauge,
  Wind,
  Battery,
  Sun,
} from "lucide-react";
import type {
  SolarPanel,
  Battery as BatteryType,
  WindTurbine,
  Inverter,
  AnyEquipment,
} from "@/types/equipment";

const allPanels = solarPanels as unknown as SolarPanel[];
const allBatteries = batteries as unknown as BatteryType[];
const allTurbines = windTurbines as unknown as WindTurbine[];
const allInverters = inverters as unknown as Inverter[];

const allEquipment: AnyEquipment[] = [
  ...allPanels,
  ...allBatteries,
  ...allTurbines,
  ...allInverters,
];

/** Find equipment by slug */
function findBySlug(slug: string): AnyEquipment | undefined {
  return allEquipment.find((e) => e.slug === slug);
}

/** Detect category */
function detectCategory(item: AnyEquipment): string {
  if ("wattage" in item && "efficiency" in item && "technology" in item)
    return "panels";
  if ("capacityKwh" in item && "chemistry" in item) return "batteries";
  if ("rotorDiameter" in item && "cutInSpeed" in item) return "turbines";
  return "inverters";
}

/** Get related items (same category, different id) */
function getRelated(item: AnyEquipment, category: string): AnyEquipment[] {
  let pool: AnyEquipment[];
  switch (category) {
    case "panels":
      pool = allPanels;
      break;
    case "batteries":
      pool = allBatteries;
      break;
    case "turbines":
      pool = allTurbines;
      break;
    default:
      pool = allInverters;
  }
  return pool.filter((e) => e.id !== item.id).slice(0, 3);
}

/** Build spec rows */
function buildSpecs(
  item: AnyEquipment,
  category: string
): { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] {
  const base = [
    { label: "Brand", value: item.brand, icon: Shield },
    { label: "Model", value: item.model, icon: Zap },
    { label: "Price", value: formatCurrency(item.price), icon: Zap },
    { label: "Rating", value: `${item.rating}/5`, icon: Star },
  ];

  switch (category) {
    case "panels": {
      const p = item as SolarPanel;
      return [
        ...base,
        { label: "Wattage", value: `${p.wattage}W`, icon: Zap },
        { label: "Efficiency", value: formatPercent(p.efficiency), icon: Gauge },
        { label: "Technology", value: p.technology, icon: Sun },
        {
          label: "Dimensions",
          value: `${p.dimensions.length} x ${p.dimensions.width} x ${p.dimensions.depth} mm`,
          icon: Ruler,
        },
        { label: "Weight", value: `${p.weight} kg`, icon: Weight },
        { label: "Warranty", value: `${p.warrantyYears} years`, icon: Shield },
        {
          label: "Temp. Coefficient",
          value: `${p.temperatureCoefficient}%/C`,
          icon: Gauge,
        },
        {
          label: "25yr Performance",
          value: formatPercent(p.performanceWarranty.year25),
          icon: Gauge,
        },
      ];
    }
    case "batteries": {
      const b = item as BatteryType;
      return [
        ...base,
        { label: "Capacity", value: `${b.capacityKwh} kWh`, icon: Battery },
        { label: "Amp Hours", value: `${b.capacityAh} Ah`, icon: Zap },
        { label: "Voltage", value: `${b.voltage}V`, icon: Zap },
        { label: "Chemistry", value: b.chemistry.toUpperCase(), icon: Battery },
        {
          label: "Cycle Life",
          value: b.cycleLife.toLocaleString(),
          icon: Gauge,
        },
        {
          label: "Depth of Discharge",
          value: formatPercent(b.depthOfDischarge),
          icon: Gauge,
        },
        {
          label: "Round-trip Eff.",
          value: formatPercent(b.roundTripEfficiency),
          icon: Gauge,
        },
        {
          label: "Dimensions",
          value: `${b.dimensions.height} x ${b.dimensions.width} x ${b.dimensions.depth} mm`,
          icon: Ruler,
        },
        { label: "Weight", value: `${b.weight} kg`, icon: Weight },
        { label: "Warranty", value: `${b.warrantyYears} years`, icon: Shield },
      ];
    }
    case "turbines": {
      const t = item as WindTurbine;
      return [
        ...base,
        {
          label: "Rated Power",
          value: formatPower(t.ratedPowerW),
          icon: Zap,
        },
        { label: "Rotor Diameter", value: `${t.rotorDiameter}m`, icon: Ruler },
        { label: "Swept Area", value: formatArea(t.sweptArea), icon: Gauge },
        {
          label: "Cut-in Speed",
          value: formatWindSpeed(t.cutInSpeed),
          icon: Wind,
        },
        {
          label: "Rated Speed",
          value: formatWindSpeed(t.ratedSpeed),
          icon: Wind,
        },
        {
          label: "Cut-out Speed",
          value: formatWindSpeed(t.cutOutSpeed),
          icon: Wind,
        },
        {
          label: "Hub Heights",
          value: t.hubHeightOptions.map((h) => `${h}m`).join(", "),
          icon: Ruler,
        },
        { label: "Type", value: t.type.toUpperCase(), icon: Wind },
        { label: "Voltage", value: `${t.voltage}V`, icon: Zap },
        { label: "Weight", value: `${t.weight} kg`, icon: Weight },
        { label: "Warranty", value: `${t.warrantyYears} years`, icon: Shield },
      ];
    }
    default: {
      const inv = item as Inverter;
      return [
        ...base,
        {
          label: "Rated Power",
          value: formatPower(inv.ratedPowerW),
          icon: Zap,
        },
        {
          label: "Max Power",
          value: formatPower(inv.maxPowerW),
          icon: Zap,
        },
        {
          label: "Efficiency",
          value: formatPercent(inv.efficiency),
          icon: Gauge,
        },
        { label: "Type", value: inv.type, icon: Zap },
        {
          label: "MPPT Channels",
          value: `${inv.mpptChannels}`,
          icon: Gauge,
        },
        {
          label: "Warranty",
          value: `${inv.warrantyYears} years`,
          icon: Shield,
        },
      ];
    }
  }
}

/** Dynamic metadata for SEO */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = findBySlug(slug);

  if (!item) {
    return { title: "Equipment Not Found" };
  }

  return {
    title: `${item.brand} ${item.model}`,
    description: item.description,
    keywords: [
      item.brand,
      item.model,
      ...item.tags,
      "green energy equipment",
      "solar",
      "wind",
    ],
  };
}

/** Generate static params for all equipment */
export function generateStaticParams() {
  return allEquipment.map((item) => ({ slug: item.slug }));
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = findBySlug(slug);

  if (!item) {
    notFound();
  }

  const category = detectCategory(item);
  const specs = buildSpecs(item, category);
  const related = getRelated(item, category);

  const categoryIcon =
    category === "panels"
      ? Sun
      : category === "batteries"
        ? Battery
        : category === "turbines"
          ? Wind
          : Zap;
  const CategoryIcon = categoryIcon;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Back link */}
      <Link
        href="/equipment"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 gap-1")}
      >
        <ArrowLeft className="size-4" />
        Back to Equipment
      </Link>

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
        {/* Left: Image + Description */}
        <div className="space-y-6">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
            <Image
              src={item.imageUrl}
              alt={`${item.brand} ${item.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CategoryIcon className="size-4" />
              <span className="capitalize">{category}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              {item.brand} {item.model}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(item.price)}
              </span>
              <div
                className="flex items-center gap-1"
                aria-label={`Rating: ${item.rating} out of 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.round(item.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm text-muted-foreground">
                  {item.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Specs */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Specifications</CardTitle>
              <CardDescription>
                Detailed technical specifications for the {item.brand}{" "}
                {item.model}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {specs.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="size-3.5" />
                        {spec.label}
                      </div>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Link
              href="/calculator/solar"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-1 gap-1"
              )}
            >
              <Sun className="size-4" />
              Solar Calc
            </Link>
            <Link
              href="/calculator/wind"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-1 gap-1"
              )}
            >
              <Wind className="size-4" />
              Wind Calc
            </Link>
          </div>
        </div>
      </div>

      {/* Related items */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            Related Equipment
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relItem) => (
              <Link key={relItem.id} href={`/equipment/${relItem.slug}`}>
                <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
                    <Image
                      src={relItem.imageUrl}
                      alt={`${relItem.brand} ${relItem.model}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {relItem.brand}
                    </p>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {relItem.model}
                    </p>
                    <p className="mt-1 text-sm font-bold text-primary">
                      {formatCurrency(relItem.price)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
