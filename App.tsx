import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDarkMode } from "./hooks/useDarkMode";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingProvider } from "@/hooks/useLoading";
import { 
  LazyWrapper, 
  createLazyComponent, 
  DashboardSkeleton, 
  TableSkeleton, 
  FormSkeleton,
  PageLoader 
} from "@/utils/lazyLoading";
import { 
  DashboardSkeleton as EnhancedDashboardSkeleton,
  TableSkeleton as EnhancedTableSkeleton,
  FormSkeleton as EnhancedFormSkeleton,
  SettingsSkeleton,
  LoadingState
} from "@/components/ui/skeleton-loaders";
import { useNetworkStatus } from "@/utils/offline";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";

// Create lazy-loaded components with enhanced skeleton loaders
const Dashboard = createLazyComponent(
  () => import("./pages/Dashboard"),
  { fallback: EnhancedDashboardSkeleton, chunkName: "dashboard" }
);

const Sales = createLazyComponent(
  () => import("./pages/Sales"),
  { fallback: EnhancedTableSkeleton, chunkName: "sales" }
);

const Purchase = createLazyComponent(
  () => import("./pages/Purchase"),
  { fallback: EnhancedTableSkeleton, chunkName: "purchase" }
);

const Inventory = createLazyComponent(
  () => import("./pages/Inventory"),
  { fallback: EnhancedTableSkeleton, chunkName: "inventory" }
);

const Accounting = createLazyComponent(
  () => import("./pages/Accounting"),
  { fallback: EnhancedTableSkeleton, chunkName: "accounting" }
);

const HR = createLazyComponent(
  () => import("./pages/HR"),
  { fallback: EnhancedTableSkeleton, chunkName: "hr" }
);

const Projects = createLazyComponent(
  () => import("./pages/Projects"),
  { fallback: EnhancedTableSkeleton, chunkName: "projects" }
);

const Reports = createLazyComponent(
  () => import("./pages/Reports"),
  { fallback: () => <LoadingState message="Loading reports..." />, chunkName: "reports" }
);

const Settings = createLazyComponent(
  () => import("./pages/Settings"),
  { fallback: SettingsSkeleton, chunkName: "settings" }
);

const Parties = createLazyComponent(
  () => import("./pages/Parties"),
  { fallback: EnhancedTableSkeleton, chunkName: "parties" }
);

const NotFound = createLazyComponent(
  () => import("./pages/NotFound"),
  { fallback: () => <LoadingState message="Loading page..." />, chunkName: "notfound" }
);

// Enhanced QueryClient with better defaults for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Offline status indicator component
const OfflineIndicator = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          You're currently offline. Some features may not be available.
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Performance monitoring
const usePerformanceMonitoring = () => {
  React.useEffect(() => {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with real performance monitoring service
      console.log('Performance monitoring initialized');
    }

    // Monitor memory usage in development
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemoryUsage = () => {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
        });
      };

      const interval = setInterval(logMemoryUsage, 30000); // Log every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);
};

const AppContent = () => {
  useDarkMode();
  usePerformanceMonitoring();
  
  return (
    <BrowserRouter>
      <OfflineIndicator />
      <ErrorBoundary>
        <Routes>
          <Route 
            path="/" 
            element={
              <LazyWrapper fallback={EnhancedDashboardSkeleton}>
                <Dashboard />
              </LazyWrapper>
            } 
          />
          <Route 
            path="/sales" 
            element={
              <LazyWrapper fallback={EnhancedTableSkeleton}>
                <Sales />
              </LazyWrapper>
            } 
          />
          <Route 
            path="/purchase" 
            element={
              <LazyWrapper fallback={EnhancedTableSkeleton}>
                <Purchase />
              </LazyWrapper>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <LazyWrapper fallback={EnhancedTableSkeleton}>
                <Inventory />
              </LazyWrapper>
            } 
          />
          <Route 
            path="/accounting" 
            element={
              <LazyWrapper fallback={EnhancedTableSkeleton}>
                <Accounting />
              </LazyWrapper>
            } 
          />
          <Route 
            path="/hr" 
            element={
              <LazyWrapper fallback={EnhancedTableSkeleton}>
                <HR />
              </LazyWrapper>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <LazyWrapper fallback={EnhancedTableSkeleton}>
                <Projects />
              </LazyWrapper>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <LazyWrapper fallback={() => <LoadingState message="Loading reports..." />}>
                <Reports />
              </LazyWrapper>
            } 
          />
          <Route 
            path="/parties" 
            element={
              <LazyWrapper fallback={EnhancedTableSkeleton}>
                <Parties />
              </LazyWrapper>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <LazyWrapper fallback={SettingsSkeleton}>
                <Settings />
              </LazyWrapper>
            } 
          />
          <Route 
            path="*" 
            element={
              <LazyWrapper fallback={() => <LoadingState message="Loading page..." />}>
                <NotFound />
              </LazyWrapper>
            } 
          />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </LoadingProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
