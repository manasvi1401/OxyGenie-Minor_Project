import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Droplets, Loader } from "lucide-react";

interface PlantCardProps {
  id: string;
  common_name: string;
  care_instructions: string;
  image_url: string;
  sunlight_requirement: string;
  watering_frequency: string;
  soil_type: string;
}

const PlantCard = ({ id, common_name, care_instructions, image_url, sunlight_requirement, watering_frequency, soil_type }: PlantCardProps) => {
  return (
    <Card className="gradient-card hover-lift hover-glow border border-border overflow-hidden">
      <div className="aspect-video overflow-hidden">
        <img
          src={image_url}
          alt={common_name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-2xl">{common_name}</CardTitle>
        <CardDescription>{care_instructions}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Sun className="w-4 h-4 text-primary" />
            <span>{sunlight_requirement}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-4 h-4 text-primary" />
            <span>{watering_frequency}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Loader className="w-4 h-4 text-primary" />
            <span>{soil_type}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/plant/${id}`} className="w-full">
          <Button variant="outline" className="w-full hover-lift">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PlantCard;
