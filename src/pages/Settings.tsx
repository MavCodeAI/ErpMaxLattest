import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings, AppSettings } from "@/hooks/useSettings";
import { AlertTriangle, Loader2 } from "lucide-react";

const defaultSettings: Omit<AppSettings, "id"> = {
  company_name: "",
  company_email: "",
  company_phone: "",
  company_address: "",
  email_notifications: true,
  sales_alerts: true,
  inventory_alerts: true,
  employee_updates: true,
  dark_mode: false,
  compact_view: false,
};

const Settings = () => {
  const { settings, isLoading, isError, updateSettings } = useSettings();
  const [formState, setFormState] = useState(defaultSettings);

  useEffect(() => {
    if (settings) {
      const { id, created_at, updated_at, ...rest } = settings;
      setFormState({ ...defaultSettings, ...rest });
    }
  }, [settings]);

  const handleInputChange = (field: keyof typeof formState, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings(formState);
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="mt-4">Unable to load settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Something went wrong while fetching your preferences. Please refresh the page and try again.
            </p>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">Update company profile and application preferences.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formState.company_name}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_email">Company Email</Label>
              <Input
                id="company_email"
                type="email"
                value={formState.company_email}
                onChange={(e) => handleInputChange("company_email", e.target.value)}
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_phone">Company Phone</Label>
              <Input
                id="company_phone"
                value={formState.company_phone}
                onChange={(e) => handleInputChange("company_phone", e.target.value)}
                placeholder="+92 300 1234567"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company_address">Company Address</Label>
              <Textarea
                id="company_address"
                value={formState.company_address}
                onChange={(e) => handleInputChange("company_address", e.target.value)}
                rows={3}
                placeholder="Street, City, Country"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Notifications & Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive important alerts and updates via email.</p>
              </div>
              <Switch
                checked={formState.email_notifications}
                onCheckedChange={(checked) => handleInputChange("email_notifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Sales Alerts</p>
                <p className="text-sm text-muted-foreground">Notify me when a new sale or invoice is created.</p>
              </div>
              <Switch
                checked={formState.sales_alerts}
                onCheckedChange={(checked) => handleInputChange("sales_alerts", checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Inventory Alerts</p>
                <p className="text-sm text-muted-foreground">Get reminders when items fall below minimum stock.</p>
              </div>
              <Switch
                checked={formState.inventory_alerts}
                onCheckedChange={(checked) => handleInputChange("inventory_alerts", checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Employee Updates</p>
                <p className="text-sm text-muted-foreground">Stay informed about HR and employee changes.</p>
              </div>
              <Switch
                checked={formState.employee_updates}
                onCheckedChange={(checked) => handleInputChange("employee_updates", checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use a dark color scheme across the dashboard.</p>
              </div>
              <Switch
                checked={formState.dark_mode}
                onCheckedChange={(checked) => handleInputChange("dark_mode", checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Compact View</p>
                <p className="text-sm text-muted-foreground">Reduce spacing to fit more information on-screen.</p>
              </div>
              <Switch
                checked={formState.compact_view}
                onCheckedChange={(checked) => handleInputChange("compact_view", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
