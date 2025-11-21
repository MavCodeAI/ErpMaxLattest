import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/purchase": "Purchase",
  "/inventory": "Inventory",
  "/accounting": "Accounting",
  "/hr": "HR",
  "/projects": "Projects",
  "/reports": "Reports",
  "/settings": "Settings",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Mobile: show only current page + home if path is deep
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const breadcrumbsToShow = isMobile && pathnames.length > 1 ?
    pathnames.slice(-1) : // Show only last item on mobile
    pathnames; // Show all on desktop

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1 min-h-[44px] px-2 sm:px-0">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbsToShow.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, pathnames.indexOf(name) + 1).join("/")}`;
          const isLast = index === breadcrumbsToShow.length - 1;
          const displayName = routeNames[routeTo] || name;

          return (
            <div key={routeTo} className="flex items-center gap-2">
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium">{displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={routeTo} className="min-h-[44px] px-2">{displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
