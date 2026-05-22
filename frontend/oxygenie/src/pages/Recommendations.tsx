import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Recommendations = () => {
  const navigate = useNavigate();

  const plants = JSON.parse(
    localStorage.getItem("plantRecommendations") || "[]"
  );

  if (!plants || plants.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>No recommendations available</p>
        <Button onClick={() => navigate("/personalize")}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <Leaf className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-center mb-6">
          Recommended Plants
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {plants.map((plant: any, i: number) => (
            <div key={i} className="border p-4 rounded-xl">
              <h3 className="font-semibold text-lg">
                {plant.common_name}
              </h3>
              <p className="text-sm">
                Season: {plant.suitable_season}
              </p>
              <p className="text-sm">
                Area: {plant.indoor_outdoor}
              </p>
              {plant.region_preference && (
                <p className="text-sm">
                  Region: {plant.region_preference}
                </p>
              )}

              <Button
                className="mt-4 w-full"
                onClick={() => navigate(`/plant/${plant.plant_id}`)}
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
