import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters?: () => void;
  className?: string;
  actions?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
  className,
  actions,
}) => {
  const hasActiveFilters = Object.values(filterValues).some(value => value !== "all" && value !== "");

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={searchPlaceholder}
                  className="pl-10 pr-10"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  aria-label="Search input"
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2 items-center">
              {filters.map((filter) => (
                <div key={filter.key} className="min-w-0">
                  <Select
                    value={filterValues[filter.key] || "all"}
                    onValueChange={(value) => onFilterChange(filter.key, value)}
                  >
                    <SelectTrigger className="w-full sm:w-auto min-w-32">
                      <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {filter.label}</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {/* Clear Filters Button */}
              {hasActiveFilters && onClearFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="flex items-center gap-2"
                  aria-label="Clear all filters"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}

              {/* Additional Actions */}
              {actions && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
              {Object.entries(filterValues).map(([key, value]) => {
                if (value === "all" || value === "") return null;

                const filter = filters.find(f => f.key === key);
                const option = filter?.options.find(o => o.value === value);

                if (!filter || !option) return null;

                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    <span className="font-medium">{filter.label}: </span>
                    {option.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-primary/20 ml-1"
                      onClick={() => onFilterChange(key, "all")}
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
