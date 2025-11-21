import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Reusable layout component for consistent page structures
interface PageLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
  spacing?: '4' | '6' | '8' | '12';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  spacing = "4"
}) => {
  return (
    <div className={`w-full max-w-none px-4 md:px-6 lg:px-8 space-y-${spacing}`}>
      {children}
    </div>
  );
};

// Reusable card grid for stats and quick actions
interface CardGridProps {
  children: React.ReactNode;
  columns?: '1' | '2' | '3' | '4' | '5';
  gap?: '2' | '4' | '6';
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = '4',
  gap = '4'
}) => {
  const getColsClass = () => {
    switch (columns) {
      case '1': return 'grid-cols-1';
      case '2': return 'grid-cols-1 sm:grid-cols-2';
      case '3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case '4': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case '5': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getColsClass()} gap-${gap}`}>
      {children}
    </div>
  );
};

// Form section component for consistent form layouts
interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  spacing?: '4' | '6' | '8';
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  spacing = '6'
}) => {
  return (
    <div className={`space-y-${spacing}`}>
      {title && (
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Responsive table wrapper for consistent table layouts
interface ResponsiveTableProps {
  children: React.ReactNode;
  maxWidth?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  maxWidth
}) => {
  const style = maxWidth ? { maxWidth } : undefined;

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card">
      <div
        className="min-w-full inline-block align-middle"
        style={style}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

// Loading state component for consistent loading feedback
interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = 'md',
  inline = false
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const container = inline
    ? "inline-flex items-center gap-2"
    : "flex items-center justify-center min-h-[200px]";

  return (
    <div className={`${container} text-center`}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className={`${iconSizes[size]} animate-spin text-primary`} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Enhanced StatCard component using design tokens
interface EnhancedStatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

const EnhancedStatCardBase: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  href,
  color = "primary"
}) => {
  return (
    <Card className="hover:shadow-sm transition">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{value}</span>
          {change && trend && (
            <span className={`text-xs font-medium ${
              trend === 'up'
                ? 'text-emerald-600 bg-emerald-600/10'
                : 'text-red-600 bg-red-600/10'
            } rounded px-1.5 py-0.5`}>
              {trend === 'up' ? '+' : '-'}{change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Memoized version for performance
export const EnhancedStatCard = React.memo(EnhancedStatCardBase);
