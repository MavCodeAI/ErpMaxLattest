// Settings Management Component
// Provides comprehensive settings interface with role-based access

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  User,
  Shield,
  Building,
  Database,
  Globe,
  Save,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useSettings } from '@/lib/settings';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';

export const SettingsManager: React.FC = () => {
  const {
    userPreferences,
    companySettings,
    securitySettings,
    moduleSettings,
    updatePreferences,
    updateCompany,
    updateSecurity,
    updateModule,
    isUpdatingPreferences,
    isUpdatingCompany,
    isUpdatingSecurity,
    isUpdatingModule,
    canUpdateSettings
  } = useSettings();

  const { currentUser } = usePermissions();
  const [showSensitiveValues, setShowSensitiveValues] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage system configuration and preferences
          </p>
        </div>
        <Badge variant="outline">
          {currentUser?.role || 'Viewer'}
        </Badge>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger 
            value="company" 
            className="flex items-center gap-2"
            disabled={!canUpdateSettings}
          >
            <Building className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex items-center gap-2"
            disabled={!canUpdateSettings}
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="modules" 
            className="flex items-center gap-2"
            disabled={!canUpdateSettings}
          >
            <Settings className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger 
            value="data" 
            className="flex items-center gap-2"
            disabled={!canUpdateSettings}
          >
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* User Preferences */}
        <TabsContent value="preferences">
          <UserPreferencesTab 
            preferences={userPreferences}
            onUpdate={updatePreferences}
            isUpdating={isUpdatingPreferences}
          />
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company">
          <CompanySettingsTab
            settings={companySettings}
            onUpdate={updateCompany}
            isUpdating={isUpdatingCompany}
          />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <SecuritySettingsTab
            settings={securitySettings}
            onUpdate={updateSecurity}
            isUpdating={isUpdatingSecurity}
            showSensitive={showSensitiveValues}
            onToggleSensitive={setShowSensitiveValues}
          />
        </TabsContent>

        {/* Module Settings */}
        <TabsContent value="modules">
          <ModuleSettingsTab
            settings={moduleSettings}
            onUpdate={updateModule}
            isUpdating={isUpdatingModule}
          />
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <DataManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const UserPreferencesTab: React.FC<{
  preferences: any;
  onUpdate: (prefs: any) => void;
  isUpdating: boolean;
}> = ({ preferences, onUpdate, isUpdating }) => {
  const [formData, setFormData] = useState(preferences || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize your personal experience
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Selection */}
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={formData.theme || 'system'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language || 'en'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={formData.currency || 'USD'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Format */}
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={formData.dateFormat || 'MM/DD/YYYY'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, dateFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={formData.notifications?.email || false}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="browserNotifications">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show browser push notifications</p>
                </div>
                <Switch
                  id="browserNotifications"
                  checked={formData.notifications?.browser || false}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, browser: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const CompanySettingsTab: React.FC<{
  settings: any;
  onUpdate: (settings: any) => void;
  isUpdating: boolean;
}> = ({ settings, onUpdate, isUpdating }) => {
  const [formData, setFormData] = useState(settings || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure your company details and business information
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.contact?.website || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, website: e.target.value }
                  }))}
                  placeholder="https://www.company.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.contact?.phone || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact?.email || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  placeholder="contact@company.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address?.street || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  placeholder="123 Business Street"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address?.city || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.address?.state || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.address?.postalCode || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, postalCode: e.target.value }
                    }))}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.address?.country || 'US'}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, country: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Company Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const SecuritySettingsTab: React.FC<{
  settings: any;
  onUpdate: (settings: any) => void;
  isUpdating: boolean;
  showSensitive: boolean;
  onToggleSensitive: (show: boolean) => void;
}> = ({ settings, onUpdate, isUpdating, showSensitive, onToggleSensitive }) => {
  const [formData, setFormData] = useState(settings || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Configure security policies and authentication requirements
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleSensitive(!showSensitive)}
          >
            {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSensitive ? 'Hide' : 'Show'} Sensitive
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Password Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minLength">Minimum Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  min="6"
                  max="50"
                  value={formData.passwordPolicy?.minLength || 8}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    passwordPolicy: { 
                      ...prev.passwordPolicy, 
                      minLength: parseInt(e.target.value) 
                    }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDays">Password Expiry (days)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  min="0"
                  value={formData.passwordPolicy?.expiryDays || 90}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    passwordPolicy: { 
                      ...prev.passwordPolicy, 
                      expiryDays: parseInt(e.target.value) 
                    }
                  }))}
                />
              </div>
            </div>
            <div className="space-y-3">
              {[
                { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                { key: 'requireLowercase', label: 'Require Lowercase Letters' },
                { key: 'requireNumbers', label: 'Require Numbers' },
                { key: 'requireSpecialChars', label: 'Require Special Characters' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    id={key}
                    checked={formData.passwordPolicy?.[key] || false}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        passwordPolicy: { 
                          ...prev.passwordPolicy, 
                          [key]: checked 
                        }
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Session Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Session Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeout">Session Timeout (minutes)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="5"
                  max="480"
                  value={formData.session?.timeoutMinutes || 60}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    session: { 
                      ...prev.session, 
                      timeoutMinutes: parseInt(e.target.value) 
                    }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSessions">Max Concurrent Sessions</Label>
                <Input
                  id="maxSessions"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.session?.maxConcurrentSessions || 3}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    session: { 
                      ...prev.session, 
                      maxConcurrentSessions: parseInt(e.target.value) 
                    }
                  }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorEnabled">Enable 2FA</Label>
                  <p className="text-sm text-muted-foreground">Allow users to enable two-factor authentication</p>
                </div>
                <Switch
                  id="twoFactorEnabled"
                  checked={formData.twoFactor?.enabled || false}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      twoFactor: { ...prev.twoFactor, enabled: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorRequired">Require 2FA</Label>
                  <p className="text-sm text-muted-foreground">Make two-factor authentication mandatory</p>
                </div>
                <Switch
                  id="twoFactorRequired"
                  checked={formData.twoFactor?.required || false}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      twoFactor: { ...prev.twoFactor, required: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const ModuleSettingsTab: React.FC<{
  settings: any;
  onUpdate: (settings: any) => void;
  isUpdating: boolean;
}> = ({ settings, onUpdate, isUpdating }) => {
  const [formData, setFormData] = useState(settings || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure business rules and defaults for each module
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sales Module */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sales Module</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={formData.sales?.invoicePrefix || 'INV'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    sales: { ...prev.sales, invoicePrefix: e.target.value }
                  }))}
                  placeholder="INV"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultPaymentTerms">Default Payment Terms (days)</Label>
                <Input
                  id="defaultPaymentTerms"
                  type="number"
                  value={formData.sales?.defaultPaymentTerms || 30}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    sales: { 
                      ...prev.sales, 
                      defaultPaymentTerms: parseInt(e.target.value) 
                    }
                  }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Purchase Module */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Purchase Module</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poPrefix">Purchase Order Prefix</Label>
                <Input
                  id="poPrefix"
                  value={formData.purchase?.poPrefix || 'PO'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    purchase: { ...prev.purchase, poPrefix: e.target.value }
                  }))}
                  placeholder="PO"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvalThreshold">Approval Threshold</Label>
                <Input
                  id="approvalThreshold"
                  type="number"
                  value={formData.purchase?.approvalThreshold || 1000}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    purchase: { 
                      ...prev.purchase, 
                      approvalThreshold: parseFloat(e.target.value) 
                    }
                  }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireApproval">Require Approval</Label>
                <p className="text-sm text-muted-foreground">Require approval for purchase orders above threshold</p>
              </div>
              <Switch
                id="requireApproval"
                checked={formData.purchase?.requireApproval || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    purchase: { ...prev.purchase, requireApproval: checked }
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Module Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const DataManagementTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Backup, restore, and manage your business data
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Import/Export will be implemented in a separate component */}
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Data Management Tools</h3>
              <p className="text-muted-foreground">
                Import/Export functionality will be available here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;