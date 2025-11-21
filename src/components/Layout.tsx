import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu, Package2, Home, Package, Users, LineChart,
  FolderKanban, Settings, LogOut, User, Bell,
  FileText, Handshake, Shield, Search
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const navItems = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Sales", href: "/sales", icon: FileText },
  { title: "Parties", href: "/parties", icon: Handshake },
  { title: "Purchase", href: "/purchase", icon: Package },
  { title: "Inventory", href: "/inventory", icon: Package2 },
  { title: "Accounting", href: "/accounting", icon: LineChart },
  { title: "HR", href: "/hr", icon: Users },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Reports", href: "/reports", icon: LineChart },
  { title: "Audit Logs", href: "/audit-logs", icon: Shield },
  { title: "Settings", href: "/settings", icon: Settings },
];

const NavItem = ({ title, href, icon: Icon, isActive, onLinkClick }: {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onLinkClick: () => void;
}) => (
  <Link
    to={href}
    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`}
    onClick={onLinkClick}
    aria-current={isActive ? "page" : undefined}
  >
    <Icon className="h-5 w-5" />
    {title}
  </Link>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management for mobile menu
  useEffect(() => {
    if (mobileMenuOpen && dialogRef.current) {
      const firstFocusable = dialogRef.current.querySelector('a, button') as HTMLElement;
      firstFocusable?.focus();
    }
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>



      {/* Desktop sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-10 w-14 flex-col border-r bg-background">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5" role="navigation" aria-label="Main navigation">
          <Link
            to="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            aria-label="Home"
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">ErpMax</span>
          </Link>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.title}
                to={item.href}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={item.title}
                aria-label={item.title}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="sr-only">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col w-full md:pl-14">
        {/* Top Navigation Bar - Responsive */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            {/* Mobile Menu Button - Better positioned */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden shrink-0"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-64 sm:w-72">
                <nav className="grid gap-2 text-lg font-medium mt-4" role="navigation" aria-label="Main navigation">
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Home"
                  >
                    <Package2 className="h-6 w-6" />
                    <span>ErpMax</span>
                  </Link>
                  {/* Mobile Search in menu */}
                  <div className="mb-4">
                    <GlobalSearch />
                  </div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.title}
                        to={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5" />
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Breadcrumbs - Responsive positioning */}
            <div className="flex-1 min-w-0">
              <Breadcrumbs />
            </div>

            {/* Desktop search and user menu */}
            <div className="hidden md:flex items-center gap-4 ml-auto">
              {/* Global Search */}
              <div className="w-80 max-w-sm">
                <GlobalSearch />
              </div>

              {/* Welcome message */}
              <div className="hidden lg:block text-sm text-muted-foreground">
                {user?.email && `Welcome, ${user.email.split('@')[0]}`}
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full px-3 py-2 hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="hidden lg:inline">Account</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile & Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile user menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <User className="h-4 w-4" />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile & Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main
          id="main-content"
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
