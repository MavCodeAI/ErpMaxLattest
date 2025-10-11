import { Skeleton } from '@/components/ui/skeleton'

// Generic table skeleton loader
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Table header skeleton */}
      <div className="flex space-x-4 p-4 border-b">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 p-4 border-b border-muted">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

// Card skeleton loader
export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

// Stats grid skeleton loader
export function StatsGridSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
      {Array.from({ length: columns }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Form skeleton loader
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}

// Navigation skeleton loader
export function NavigationSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

// Dashboard page skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats grid */}
      <StatsGridSkeleton />
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
      
      {/* Recent activity table */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
        <TableSkeleton rows={3} />
      </div>
    </div>
  )
}

// Invoice skeleton
export function InvoiceSkeleton() {
  return (
    <div className="space-y-6">
      {/* Invoice header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      {/* Invoice items table */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-24" />
        </div>
        <TableSkeleton rows={4} />
      </div>
      
      {/* Invoice totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between border-t pt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Settings skeleton
export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Settings tabs */}
      <div className="flex space-x-4 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      
      {/* Settings content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FormSkeleton fields={6} />
        </div>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="p-4 border rounded-lg">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Audit log skeleton
export function AuditLogSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      {/* Audit entries */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Generic loading state
export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

// Error state
export function ErrorState({ message = "Something went wrong" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <Skeleton className="h-6 w-6" />
      </div>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
  )
}

// Empty state
export function EmptyState({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Skeleton className="h-6 w-6" />
      </div>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-28" />
    </div>
  )
}