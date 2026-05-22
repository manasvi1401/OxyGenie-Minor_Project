import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

const categoryMap: Record<string, string> = {
  "Oxygen-producing": "oxygen",
  "Oxygen-rich": "oxygen",
  Medicinal: "medicinal",
  Fruit: "fruit",
  "Fruit-bearing": "fruit",
  Flowering: "flowering",
  Herb: "herb",
  Indoor: "indoor",
  Ornamental: "ornamental",
};

const Personalize = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    region: "",
    season: "",
    areaType: "",
    preferences: [] as string[],
  });

  const togglePreference = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter((p) => p !== pref)
        : [...prev.preferences, pref],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.region || !formData.season || !formData.areaType) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      season: [formData.season.toLowerCase()],
      region: formData.region.toLowerCase(),
      indoor_outdoor: formData.areaType.toLowerCase(),
      categories: formData.preferences
        .map((p) => categoryMap[p])
        .filter(Boolean)
        .map((c) => c.toLowerCase()),
      sunlight: "medium",
      oxygen_output: 50,
      top_k: null,
    };

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      localStorage.setItem("userPreferences", JSON.stringify(formData));
      localStorage.setItem("plantRecommendations", JSON.stringify(data.results));

      toast.success("Personalized plant recommendations ready!");
      navigate("/recommendations");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="gradient-card p-8 md:p-12 rounded-2xl border border-border">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Let's Personalize Your Experience
            </h1>
            <p className="text-muted-foreground">
              Get plant recommendations tailored for you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* REGION */}
            <div>
              <Label>Region *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) =>
                  setFormData({ ...formData, region: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="west india">West India</SelectItem>
                  <SelectItem value="south india">South India</SelectItem>
                  <SelectItem value="north india">North India</SelectItem>
                  <SelectItem value="central india">Central India</SelectItem>
                  <SelectItem value="tropical">Tropical</SelectItem>
                  <SelectItem value="east india">East India</SelectItem>
                  <SelectItem value="subtropical">Subtropical</SelectItem>
                  <SelectItem value="temperate">Temperate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SEASON */}
            <div>
              <Label>Season *</Label>
              <Select
                value={formData.season}
                onValueChange={(value) =>
                  setFormData({ ...formData, season: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="autumn">Autumn</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                  <SelectItem value="monsoon">Monsoon</SelectItem>
                  <SelectItem value="all-season">All Season</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AREA TYPE */}
            <div>
              <Label>Area Type *</Label>
              <Select
                value={formData.areaType}
                onValueChange={(value) =>
                  setFormData({ ...formData, areaType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* CATEGORY */}
            <div>
              <Label>Category</Label>
              <div className="space-y-2 mt-2">
                {[
                  "Oxygen-producing",
                  "Medicinal",
                  "Fruit",
                  "Flowering",
                  "Herb",
                  "Ornamental",
                ].map((pref) => (
                  <div key={pref} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.preferences.includes(pref)}
                      onCheckedChange={() => togglePreference(pref)}
                    />
                    <span>{pref}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Generating..." : "Generate Recommendations"}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Personalize;