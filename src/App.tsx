import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDarkMode } from "./hooks/useDarkMode";
import { useAuth } from "./hooks/useAuth";
import { Layout } from "./components/Layout";
import { RBACProvider } from "./contexts/RBACContext";
import { AuthBoundary } from "./components/AuthBoundary";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sales = lazy(() => import("./pages/Sales"));
const Purchase = lazy(() => import("./pages/Purchase"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Accounting = lazy(() => import("./pages/Accounting"));
const HR = lazy(() => import("./pages/HR"));
const Projects = lazy(() => import("./pages/Projects"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Parties = lazy(() => import("./pages/Parties"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));

import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { SearchProvider } from "./contexts/SearchContext";

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p>Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes - cache data for 10 minutes
      retry: 2, // Retry failed requests up to 2 times
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  useDarkMode();
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SearchProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <AuthBoundary onSignOut={() => window.location.href = '/auth'}>
                  <RBACProvider>
                    <ProtectedRoute>
                      <Layout>
                        <RouteErrorBoundary>
                          <Suspense fallback={<PageLoader />}>
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/sales" element={<Sales />} />
                              <Route path="/purchase" element={<Purchase />} />
                              <Route path="/inventory" element={<Inventory />} />
                              <Route path="/accounting" element={<Accounting />} />
                              <Route path="/hr" element={<HR />} />
                              <Route path="/projects" element={<Projects />} />
                              <Route path="/reports" element={<Reports />} />
                              <Route path="/parties" element={<Parties />} />
                              <Route path="/audit-logs" element={<AuditLogs />} />
                              <Route path="/settings" element={<Settings />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </RouteErrorBoundary>
                      </Layout>
                    </ProtectedRoute>
                  </RBACProvider>
                </AuthBoundary>
              }
            />
          </Routes>
        </SearchProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
