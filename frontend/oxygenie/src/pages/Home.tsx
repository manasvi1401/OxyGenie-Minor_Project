import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Leaf, Sparkles, Calendar, Camera } from "lucide-react";
import heroImage from "@/assets/hero-plants.jpg";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary">
                <Sparkles className="w-4 h-4" />
                AI-Powered Plant Care
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Breathe Better, Grow Smarter with{" "}
                <span className="text-primary">OxyGenie</span> 🌱
              </h1>
              <p className="text-lg text-muted-foreground">
                Your personalized plant care assistant powered by AI. Get smart recommendations,
                track care schedules, and detect plant diseases with ease.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/personalize">
                  <Button size="lg" className="gradient-primary hover-lift">
                    Get Started
                  </Button>
                </Link>
                <Link to="/recommendations">
                  <Button size="lg" variant="outline" className="hover-lift">
                    Browse Plants
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-float">
              <img
                src={heroImage}
                alt="Beautiful indoor plants"
                className="rounded-2xl shadow-2xl hover-glow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need for Plant Care</h2>
            <p className="text-muted-foreground text-lg">
              Smart features to help your plants thrive
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="gradient-card p-8 rounded-2xl hover-lift border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
              <p className="text-muted-foreground">
                Get plant suggestions based on your region, season, and preferences
              </p>
            </div>
            <div className="gradient-card p-8 rounded-2xl hover-lift border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Care Schedules</h3>
              <p className="text-muted-foreground">
                Never miss watering or fertilizing with intelligent reminders
              </p>
            </div>
            <div className="gradient-card p-8 rounded-2xl hover-lift border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Disease Detection</h3>
              <p className="text-muted-foreground">
                Upload plant photos to detect issues and get treatment advice
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Plant Care?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of plant lovers growing healthier, happier plants
          </p>
          <Link to="/personalize">
            <Button size="lg" variant="secondary" className="hover-lift">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
