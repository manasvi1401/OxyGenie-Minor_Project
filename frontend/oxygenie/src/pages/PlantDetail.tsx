import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Droplets, Loader, Leaf, ArrowLeft, Calendar } from "lucide-react";
import { Trees } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const mapGrowthRateToFactor = (
  growthRate: string | number | undefined | null
) => {
  if (growthRate == null) return 1;
  if (typeof growthRate === "number") {
    if (!Number.isFinite(growthRate) || growthRate <= 0) return 1;
    return growthRate;
  }
  const normalized = String(growthRate).toLowerCase();
  if (normalized.includes("slow")) return 0.5;
  if (normalized.includes("medium") || normalized.includes("moderate")) return 1;
  if (normalized.includes("fast") || normalized.includes("high")) return 1.5;
  return 1;
};

type PlantType = {
  growth_rate?: string | number;
  recommended_area_sqm?: number;
  oxygen_output_g_per_day?: number;
  common_name?: string;
};

const PlantDetail = () => {
  const { id } = useParams();
  const [plantData, setPlantData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const numericId = Number(id);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:8000/plants/${numericId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        setPlantData(data);
        console.log("Testing...", data);
      })
      .catch((err) => {
        setError(err as Error);
        console.error("Testing...", err);
      });
  }, [id, numericId]);

  if (error) return <div>Error: {error.message}</div>;
  if (!plantData) return <div>Loading...</div>;

  const plant = plantData.plant;
  if (!plant) return <div className="container py-12">Plant not found</div>;

  const rawCare = String(plant.care_instructions || "");
  const careLines = rawCare
    .split(". ")
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .map((s: string) => (s.endsWith(".") ? s : s + "."));

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <Link to="/recommendations">
          <Button variant="ghost" className="mb-6 hover-lift">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plants
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="rounded-2xl overflow-hidden hover-glow">
            <img
              src={plant.image_url}
              alt={plant.common_name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {plant.common_name}
              </h1>
              <p className="text-muted-foreground italic">
                {plant.scientific_name}
              </p>
            </div>

            <p className="text-lg">{plant.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Sun className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Sunlight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.sunlight_requirement}</p>
                </CardContent>
              </Card>

              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Droplets className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Fertilizer Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.fertilizer_type}</p>
                </CardContent>
              </Card>

              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Loader className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">
                    Plantation Area (Indoor/Outdoor)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.indoor_outdoor}</p>
                </CardContent>
              </Card>

              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Leaf className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.category}</p>
                </CardContent>
              </Card>
            </div>

            <Link to="/schedule" style={{ display: "none" }}>
              <Button size="lg" className="w-full gradient-primary hover-lift">
                <Calendar className="w-4 h-4 mr-2" />
                Add to Care Schedule
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-1 gap-8 mb-8">
          <div className="space-y-12">
            <div className="grid grid-cols-4 gap-2">
              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Sun className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.growth_rate}</p>
                </CardContent>
              </Card>

              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Droplets className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Pruning Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.pruning_frequency}</p>
                </CardContent>
              </Card>

              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Loader className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Region Preference</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.region_preference}</p>
                </CardContent>
              </Card>

              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Leaf className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Harvesting Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.harvesting_timeline}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-1 gap-8 mb-8">
          <div className="space-y-12">
            <div className="grid grid-cols-4 gap-2">
              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Sun className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Suitable Season</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.suitable_season}</p>
                </CardContent>
              </Card>

              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Droplets className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Watering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.watering_frequency}</p>
                </CardContent>
              </Card>

              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Loader className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">Soil Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.soil_type}</p>
                </CardContent>
              </Card>

              <Card className="gradient-card border border-border">
                <CardHeader className="pb-3">
                  <Leaf className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-sm">
                    Area Taken (in sqm)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{plant.recommended_area_sqm}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="gradient-card border border-border">
            <CardHeader>
              <CardTitle>Care Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {careLines.map((line, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="gradient-card border border-border">
            <CardHeader>
              <CardTitle>Benefits & Uses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">
                    Oxygen Production per day
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {plant.oxygen_output_g_per_day}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Used as</h4>
                  <p className="text-sm text-muted-foreground">
                    {plant.uses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {plant && plant.oxygen_output_g_per_day != null && (
          <>
            <PlantCharts plant={plant} />
            {/* NEW: dynamic tree growth visual */}
            <TreeGrowthVisualizer plant={plant} />
          </>
        )}
      </div>
    </div>
  );
};

export default PlantDetail;

// Build synthetic monthly & yearly time-series from plant fields
const usePlantTimeSeries = (plant: PlantType) => {
  const growthFactor = mapGrowthRateToFactor(plant.growth_rate);
  const areaMax = Number(plant.recommended_area_sqm || 1);
  const oxygenPerDay = Number(plant.oxygen_output_g_per_day || 0);

  const monthlyData = useMemo(() => {
    const months = [
      "Month 1",
      "Month 2",
      "Month 3",
      "Month 4",
      "Month 5",
      "Month 6",
      "Month 9",
      "Month 12",
    ];
    return months.map((label, index) => {
      const t = (index + 1) / months.length;
      const growthScore = Math.round(
        10 * growthFactor * Math.log2(1 + (index + 1))
      );
      const area = Number((areaMax * t).toFixed(2));
      const oxygenCumulative = Math.round(oxygenPerDay * 30 * (index + 1));
      return {
        label,
        growthScore,
        areaSqm: area,
        oxygenG: oxygenCumulative,
      };
    });
  }, [growthFactor, areaMax, oxygenPerDay]);

  const yearlyData = useMemo(() => {
    const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
    return years.map((label, index) => {
      const t = (index + 1) / years.length;
      const growthScore = Math.round(50 * growthFactor * t);
      const area = Number((areaMax * t).toFixed(2));
      const oxygenCumulative = Math.round(oxygenPerDay * 365 * (index + 1));
      return {
        label,
        growthScore,
        areaSqm: area,
        oxygenG: oxygenCumulative,
      };
    });
  }, [growthFactor, areaMax, oxygenPerDay]);

  return { monthlyData, yearlyData };
};

// tree-shaped custom dot for charts
const TreeDot = (props: any) => {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g transform={`translate(${cx - 6}, ${cy - 12})`}>
      <Trees width={12} height={12} className="text-emerald-500" />
    </g>
  );
};

// ONE place for all charts
const PlantCharts = ({ plant }: { plant: PlantType }) => {
  const { monthlyData, yearlyData } = usePlantTimeSeries(plant);
  const [mode, setMode] = useState<"months" | "years">("months");

  const data = mode === "months" ? monthlyData : yearlyData;

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trees className="w-6 h-6 text-primary" />
          Growth & Oxygen Visuals
        </h2>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setMode("months")}
            className={`px-4 py-2 text-sm font-medium border ${
              mode === "months"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground"
            }`}
          >
            Months
          </button>
          <button
            type="button"
            onClick={() => setMode("years")}
            className={`px-4 py-2 text-sm font-medium border -ml-px ${
              mode === "years"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground"
            }`}
          >
            Years
          </button>
        </div>
      </div>

      {/* Chart 1: Growth rate over time */}
<Card className="gradient-card border border-border">
  <CardHeader>
    <CardTitle>
      Growth Score Over {mode === "months" ? "Months" : "Years"}
    </CardTitle>
  </CardHeader>
  <CardContent className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
        <XAxis dataKey="label" />
        {/* Y-axis with unit */}
        <YAxis
          label={{
            value: "Growth rate (%)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="growthScore"
          name="Growth rate (%)"   // label in tooltip/legend
          stroke="#22c55e"
          fill="url(#growthGradient)"
          isAnimationActive={true}
          animationDuration={1000}
          dot={<TreeDot />}
        />
      </AreaChart>
    </ResponsiveContainer>
  </CardContent>
</Card>


      {/* Chart 2: Area taken over time */}
      <Card className="gradient-card border border-border">
        <CardHeader>
          <CardTitle>
            Area Taken (sqm) Over {mode === "months" ? "Months" : "Years"}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="areaSqm"
                stroke="#3b82f6"
                fill="url(#areaGradient)"
                isAnimationActive={true}
                animationDuration={1000}
                dot={<TreeDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 3: Oxygen production over time */}
      <Card className="gradient-card border border-border">
        <CardHeader>
          <CardTitle>
            Oxygen Production Over {mode === "months" ? "Months" : "Years"}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="oxygenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="oxygenG"
                name="Oxygen (g)"
                stroke="#f97316"
                fill="url(#oxygenGradient)"
                isAnimationActive={true}
                animationDuration={1000}
                dot={<TreeDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// NEW: dynamic tree growth visualizer
// BETTER: more “correct” tree growth visualizer
const TreeGrowthVisualizer = ({ plant }: { plant: PlantType }) => {
  const growthFactor = mapGrowthRateToFactor(plant.growth_rate);
  const areaMax = Number(plant.recommended_area_sqm || 1);
  const oxygenPerDay = Number(plant.oxygen_output_g_per_day || 0);

  // Normalize values into 0..1 ranges for visuals
  const normGrowth = Math.min(1, growthFactor / 2);          // > growth → taller
  const normArea = Math.min(1, areaMax / 10);                // > area → wider (assumes up to ~10 sqm typical)
  const normOxygen = Math.min(1, oxygenPerDay / 200);        // > oxygen → brighter

  const trunkHeight = 60 + 80 * normGrowth;                  // 60–140 px
  const trunkWidth = 8 + 6 * normGrowth;                     // 8–14 px
  const canopyWidth = 60 + 80 * normArea;                    // 60–140 px
  const canopyHeight = 40 + 60 * normArea;                   // 40–100 px

  const foliageColor = `rgba(34, 197, 94, ${0.5 + 0.5 * normOxygen})`; // darker→brighter
  const glowOpacity = 0.2 + 0.5 * normOxygen;

  return (
    <div className="mt-10">
      <Card className="gradient-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trees className="w-5 h-5 text-primary" />
            Tree Growth Animation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* visual */}
            <div className="relative h-52 w-full max-w-sm">
              {/* soil line */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-emerald-900/60 rounded-full" />

              {/* trunk */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-900 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${trunkWidth}px`,
                  height: `${trunkHeight}px`,
                }}
              />

              {/* canopy / foliage */}
              <div
                className="absolute bottom-2 left-1/2 rounded-full shadow-lg transition-all duration-700 ease-out"
                style={{
                  width: `${canopyWidth}px`,
                  height: `${canopyHeight}px`,
                  transform: "translateX(-50%) translateY(-60%)",
                  background: `radial-gradient(circle at 50% 30%, ${foliageColor}, rgba(16, 185, 129, 0.8))`,
                  boxShadow: `0 0 30px rgba(16, 185, 129, ${glowOpacity})`,
                }}
              />

              {/* subtle branch suggestion */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
                style={{
                  width: `${canopyWidth * 0.6}px`,
                  height: `${canopyHeight * 0.35}px`,
                  borderRadius: "999px",
                  borderBottom: "3px solid rgba(15, 118, 110, 0.7)",
                  transform: "translateX(-50%) translateY(-50%)",
                }}
              />
            </div>

            {/* explanation side panel */}
            <div className="space-y-2 text-sm text-muted-foreground max-w-sm">
              <p>
                Growth rate:{" "}
                <span className="font-semibold">{String(plant.growth_rate)}%</span>
              </p>
              <p>
                Recommended area:{" "}
                <span className="font-semibold">
                  {areaMax ? `${areaMax} sqm` : "N/A"}
                </span>
              </p>
              <p>
                Oxygen per day:{" "}
                <span className="font-semibold">
                  {oxygenPerDay ? `${oxygenPerDay} g` : "N/A"}
                </span>
              </p>
              <p className="mt-2">
                Tree height scales with growth rate, canopy width with
                area taken, and leaf brightness with oxygen production, so
                more vigorous plants appear taller, broader, and brighter.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
