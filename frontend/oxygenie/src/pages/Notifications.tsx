import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { toast } from "sonner";

const Notifications = () => {
  const [settings, setSettings] = useState({
    watering: true,
    fertilizing: true,
    pruning: false,
    healthAlerts: true,
    dailyTips: true,
    weeklyReport: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = () => {
    toast.success("Notification preferences saved!");
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Notification Settings</h1>
          <p className="text-muted-foreground text-lg">
            Customize how you want to be reminded about plant care
          </p>
        </div>

        <Card className="gradient-card border border-border mb-6">
          <CardHeader>
            <CardTitle>Care Reminders</CardTitle>
            <CardDescription>Get notified about daily plant care tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="watering" className="cursor-pointer">
                <div className="font-semibold">Watering Reminders</div>
                <div className="text-sm text-muted-foreground">
                  Daily notifications for watering schedule
                </div>
              </Label>
              <Switch
                id="watering"
                checked={settings.watering}
                onCheckedChange={() => handleToggle("watering")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="fertilizing" className="cursor-pointer">
                <div className="font-semibold">Fertilizing Reminders</div>
                <div className="text-sm text-muted-foreground">
                  Notifications for fertilization schedule
                </div>
              </Label>
              <Switch
                id="fertilizing"
                checked={settings.fertilizing}
                onCheckedChange={() => handleToggle("fertilizing")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pruning" className="cursor-pointer">
                <div className="font-semibold">Pruning Reminders</div>
                <div className="text-sm text-muted-foreground">
                  Alerts for pruning and maintenance
                </div>
              </Label>
              <Switch
                id="pruning"
                checked={settings.pruning}
                onCheckedChange={() => handleToggle("pruning")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border border-border mb-6">
          <CardHeader>
            <CardTitle>Health & Insights</CardTitle>
            <CardDescription>
              Stay informed about plant health and care tips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="healthAlerts" className="cursor-pointer">
                <div className="font-semibold">Health Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Immediate alerts for plant health issues
                </div>
              </Label>
              <Switch
                id="healthAlerts"
                checked={settings.healthAlerts}
                onCheckedChange={() => handleToggle("healthAlerts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dailyTips" className="cursor-pointer">
                <div className="font-semibold">Daily Care Tips</div>
                <div className="text-sm text-muted-foreground">
                  Learn something new about plant care every day
                </div>
              </Label>
              <Switch
                id="dailyTips"
                checked={settings.dailyTips}
                onCheckedChange={() => handleToggle("dailyTips")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="weeklyReport" className="cursor-pointer">
                <div className="font-semibold">Weekly Summary</div>
                <div className="text-sm text-muted-foreground">
                  Get a weekly report of your plant care activities
                </div>
              </Label>
              <Switch
                id="weeklyReport"
                checked={settings.weeklyReport}
                onCheckedChange={() => handleToggle("weeklyReport")}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={saveSettings} size="lg" className="w-full gradient-primary hover-lift">
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default Notifications;
