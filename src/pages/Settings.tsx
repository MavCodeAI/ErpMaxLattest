import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Bell, Palette, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const Settings = () => {
  const { settings, isLoading, updateSettings } = useSettings();
  
  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    email_notifications: true,
    sales_alerts: true,
    inventory_alerts: true,
    employee_updates: false,
    dark_mode: false,
    compact_view: false,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name,
        company_email: settings.company_email,
        company_phone: settings.company_phone,
        company_address: settings.company_address,
        email_notifications: settings.email_notifications,
        sales_alerts: settings.sales_alerts,
        inventory_alerts: settings.inventory_alerts,
        employee_updates: settings.employee_updates,
        dark_mode: settings.dark_mode,
        compact_view: settings.compact_view,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6 max-w-6xl mx-auto">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Manage your application settings</p>
          </div>
          <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Building2 className="w-5 h-5 text-primary" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input 
                  id="company-name" 
                  placeholder="Your Company Name" 
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Email</Label>
                <Input 
                  id="company-email" 
                  type="email" 
                  placeholder="company@example.com" 
                  value={formData.company_email}
                  onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone</Label>
                <Input 
                  id="company-phone" 
                  placeholder="+92 300 1234567" 
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Input 
                  id="company-address" 
                  placeholder="Company Address" 
                  value={formData.company_address}
                  onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-sm md:text-base">Email Notifications</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Receive email updates about your business</p>
              </div>
              <Switch 
                checked={formData.email_notifications}
                onCheckedChange={(checked) => setFormData({ ...formData, email_notifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-sm md:text-base">Sales Alerts</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Get notified about new sales and invoices</p>
              </div>
              <Switch 
                checked={formData.sales_alerts}
                onCheckedChange={(checked) => setFormData({ ...formData, sales_alerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-sm md:text-base">Inventory Alerts</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Receive low stock notifications</p>
              </div>
              <Switch 
                checked={formData.inventory_alerts}
                onCheckedChange={(checked) => setFormData({ ...formData, inventory_alerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-sm md:text-base">Employee Updates</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Get updates about employee activities</p>
              </div>
              <Switch 
                checked={formData.employee_updates}
                onCheckedChange={(checked) => setFormData({ ...formData, employee_updates: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Palette className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-sm md:text-base">Dark Mode</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Switch to dark theme</p>
              </div>
              <Switch 
                checked={formData.dark_mode}
                onCheckedChange={(checked) => setFormData({ ...formData, dark_mode: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-sm md:text-base">Compact View</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Use compact layout for tables</p>
              </div>
              <Switch 
                checked={formData.compact_view}
                onCheckedChange={(checked) => setFormData({ ...formData, compact_view: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button (Mobile) */}
        <div className="sm:hidden">
          <Button onClick={handleSave} className="gap-2 w-full" size="lg">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
