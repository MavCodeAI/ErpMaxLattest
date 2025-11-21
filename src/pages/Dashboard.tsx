import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrendingUp, TrendingDown, Package, Users, DollarSign, FileText, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { PageLayout, CardGrid, ResponsiveTable, LoadingState } from "@/components/ui/patterns";
import { EnhancedStatCard } from "@/components/ui/patterns";

// Skeleton loading component for better UX
const DashboardSkeleton = () => (
  <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-40" />
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Quick Actions Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-8 w-full mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Recent Activity Skeleton */}
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
              <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const Dashboard = () => {
  const { summary, isLoading, isError } = useDashboardData();

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state with better UI
  if (isError) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <TrendingDown className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Unable to load dashboard</h3>
            <p className="text-red-700 text-sm">Please check your connection and try again.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data - in real implementation, this would come from data
  const stats = [
    {
      title: "Total Revenue",
      value: "PKR 2,45,000",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: "1,247",
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Inventory Items",
      value: "3,456",
      change: "-2.1%",
      trend: "down" as const,
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Active Employees",
      value: "24",
      change: "+15.3%",
      trend: "up" as const,
      icon: Users,
      color: "text-orange-600",
    },
  ];

  const recentActivities = [
    { id: 1, action: "New order created", details: "INV-2024-001", time: "2 hours ago" },
    { id: 2, action: "Inventory updated", details: "50 items restocked", time: "4 hours ago" },
    { id: 3, action: "New employee hired", details: "John Doe - Sales Manager", time: "1 day ago" },
    { id: 4, action: "Payment received", details: "Invoice #001 paid", time: "2 days ago" },
  ];

  // Enhanced stats data with design system colors
  const enhancedStats = stats.map((stat, index) => {
    const colorMap = {
      'text-green-600': 'success' as const,
      'text-blue-600': 'primary' as const,
      'text-purple-600': 'primary' as const, // violet isn't in our theme, map to primary
      'text-orange-600': 'warning' as const,
    };

    return {
      ...stat,
      icon: stat.icon,
      color: colorMap[stat.color] || ('primary' as const),
    };
  });

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-72">
            {/* Search component would go here */}
          </div>
          <Button asChild>
            <Link to="/inventory" className="gap-2">
              <PlusIcon className="w-4 h-4" />
              Quick Add Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards Grid */}
      <CardGrid columns="4">
        {enhancedStats.map((stat, index) => (
          <EnhancedStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </CardGrid>

      {/* Quick Actions Grid */}
      <CardGrid columns="4">
        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Create Invoice</h3>
                <p className="text-sm text-muted-foreground">Generate new sales invoice</p>
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/sales">Create</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Add Inventory</h3>
                <p className="text-sm text-muted-foreground">Stock new items</p>
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/inventory">Add</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium">Manage HR</h3>
                <p className="text-sm text-muted-foreground">Employee records</p>
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/hr">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-medium">Purchase Orders</h3>
                <p className="text-sm text-muted-foreground">Manage suppliers</p>
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/purchase">Create</Link>
            </Button>
          </CardContent>
        </Card>
      </CardGrid>

      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0 border-border">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Dashboard;
