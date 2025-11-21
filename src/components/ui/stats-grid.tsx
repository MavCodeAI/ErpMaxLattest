import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: string;
}

interface StatsGridProps {
  stats: StatCard[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const TrendIcon = ({ trend, change }: { trend?: string; change?: string }) => {
  if (!change) return null;

  const getIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return <div className="flex items-center gap-1">{getIcon()}</div>;
};

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  className,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={cn(
              'border-l-4 border-l-primary hover:shadow-lg transition-shadow',
              {
                'border-l-blue-500': index % 4 === 0,
                'border-l-green-500': index % 4 === 1,
                'border-l-yellow-500': index % 4 === 2,
                'border-l-purple-500': index % 4 === 3,
              }
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">{stat.title}</h3>
              <Icon className={cn('h-5 w-5', stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {(stat.change || stat.description) && (
                <div className="flex items-center justify-between mt-1">
                  {stat.change && (
                    <p className={cn(
                      'text-xs flex items-center gap-1',
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                    )}>
                      <TrendIcon trend={stat.trend} change={stat.change} />
                      {stat.change}
                    </p>
                  )}
                  {stat.description && (
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
