import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Boxes, 
  Receipt, 
  Users, 
  FolderKanban,
  Settings,
  FileText,
  Menu,
  Building2,
  Moon,
  Sun,
  User,
  LogOut,
  Plus,
  Search,
  Bell,
  ChevronDown,
  Zap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/useSettings";
import { useAccessibility, announceToScreenReader, SkipLink } from "@/utils/accessibility";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ShoppingCart, label: "Sales", path: "/sales" },
  { icon: Package, label: "Purchase", path: "/purchase" },
  { icon: Boxes, label: "Inventory", path: "/inventory" },
  { icon: Receipt, label: "Accounting", path: "/accounting" },
  { icon: Users, label: "HR", path: "/hr" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: Building2, label: "Parties", path: "/parties" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="bg-sidebar" role="navigation" aria-label="Main navigation">
        <div className="p-4 md:p-6 border-b border-sidebar-border">
          <h1 
            className={`text-xl md:text-2xl font-bold text-sidebar-foreground transition-all ${!open && "hidden"}`}
            id="app-title"
          >
            ErpMax
          </h1>
          {!open && (
            <h1 
              className="text-lg md:text-xl font-bold text-sidebar-foreground text-center"
              id="app-title-collapsed"
              aria-label="ErpMax - Business Management System"
            >
              E
            </h1>
          )}
          {open && (
            <p className="text-xs text-sidebar-foreground/70 mt-1">Business Management</p>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      className={
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }
                      tooltip={item.label}
                    >
                      <NavLink 
                        to={item.path}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={`Navigate to ${item.label}`}
                      >
                        <Icon className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                        <span className="font-medium text-sm md:text-base">{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// Mock user data - will be replaced with real auth later
const mockUser = {
  name: "John Doe",
  email: "john.doe@company.com",
  avatar: "",
  role: "Administrator"
};

// Quick actions data
const quickActions = [
  { label: "New Invoice", icon: Receipt, action: "/sales", color: "text-blue-600" },
  { label: "Add Item", icon: Package, action: "/inventory", color: "text-green-600" },
  { label: "Add Employee", icon: Users, action: "/hr", color: "text-purple-600" },
  { label: "New Project", icon: FolderKanban, action: "/projects", color: "text-orange-600" },
];

function UserDropdown() {
  const navigate = useNavigate();
  const { highContrast, toggleHighContrast } = useAccessibility();
  
  const handleLogout = () => {
    announceToScreenReader("Logging out", "polite");
    toast.success("Logged out successfully");
    // Add actual logout logic here when auth is implemented
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/settings");
    toast.info("Profile settings opened");
    announceToScreenReader("Profile settings opened", "polite");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-9 w-9 p-0 min-h-[44px] min-w-[44px]"
          ariaLabel={`User menu for ${mockUser.name}`}
          ariaHasPopup={true}
          ariaExpanded={false}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={mockUser.avatar} alt={`${mockUser.name}'s profile picture`} />
            <AvatarFallback className="text-xs" aria-label={`${mockUser.name} initials`}>
              {mockUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" role="menu" aria-label="User menu">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{mockUser.name}</p>
            <p className="text-xs text-muted-foreground">{mockUser.email}</p>
            <Badge variant="secondary" className="text-xs w-fit">
              {mockUser.role}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile} role="menuitem">
          <User className="mr-2 h-4 w-4" aria-hidden="true" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={toggleHighContrast} 
          role="menuitem"
          aria-pressed={highContrast}
        >
          <span className="mr-2 h-4 w-4 flex items-center justify-center" aria-hidden="true">
            {highContrast ? "🔆" : "🔅"}
          </span>
          {highContrast ? "Disable" : "Enable"} High Contrast
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600" role="menuitem">
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function QuickActions() {
  const navigate = useNavigate();

  const handleQuickAction = (action: string, label: string) => {
    navigate(action);
    announceToScreenReader(`Quick action: ${label} opened`, "polite");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 min-h-[44px] min-w-[44px]"
          ariaLabel="Quick actions menu"
          ariaHasPopup={true}
        >
          <Zap className="h-5 w-5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3" 
        align="end" 
        role="dialog" 
        aria-label="Quick actions menu"
      >
        <div className="space-y-2">
          <h4 className="font-medium text-sm" id="quick-actions-title">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="quick-actions-title">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto flex-col gap-2 p-3 min-h-[44px]"
                  onClick={() => handleQuickAction(action.action, action.label)}
                  ariaLabel={`Quick action: ${action.label}`}
                >
                  <Icon className={`h-5 w-5 ${action.color}`} aria-hidden="true" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationBell() {
  // Mock notifications - will be replaced with real data later
  const notifications = [
    { id: 1, message: "Low stock alert: Laptop inventory is running low", type: "warning" },
    { id: 2, message: "New invoice payment received", type: "success" },
    { id: 3, message: "Employee John Doe checked in", type: "info" },
  ];

  const notificationCount = notifications.length;
  const hasNotifications = notificationCount > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 relative min-h-[44px] min-w-[44px]"
          ariaLabel={hasNotifications ? 
            `Notifications - ${notificationCount} unread` : 
            "Notifications - no unread messages"
          }
          ariaHasPopup={true}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {hasNotifications && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
              aria-label={`${notificationCount} unread notifications`}
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end" 
        role="dialog" 
        aria-label="Notifications panel"
      >
        <div className="p-4 border-b">
          <h4 className="font-medium" id="notifications-title">
            Notifications
            {hasNotifications && (
              <span className="ml-2 text-sm text-muted-foreground">
                ({notificationCount} unread)
              </span>
            )}
          </h4>
        </div>
        <div 
          className="max-h-64 overflow-y-auto" 
          role="region" 
          aria-labelledby="notifications-title"
          aria-live="polite"
        >
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>No notifications</p>
            </div>
          ) : (
            <ul role="list">
              {notifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className="p-3 border-b last:border-0 hover:bg-muted/50"
                  role="listitem"
                >
                  <div className="flex items-start gap-2">
                    <div 
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'success' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      aria-label={`${notification.type} notification`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">Just now</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { settings, updateSettings } = useSettings();
  const { highContrast } = useAccessibility();
  
  const toggleDarkMode = () => {
    const newMode = !settings?.dark_mode;
    updateSettings({ dark_mode: newMode });
    announceToScreenReader(
      newMode ? "Dark mode enabled" : "Light mode enabled", 
      "polite"
    );
  };

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen w-full bg-background ${highContrast ? 'high-contrast' : ''}`}>
        {/* Skip Links */}
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
        
        <div id="navigation">
          <AppSidebar />
        </div>
        
        <div className="flex flex-col flex-1 w-full">
          {/* Mobile Header */}
          <header 
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden"
            role="banner"
            aria-label="Mobile header"
          >
            <div className="flex h-14 items-center justify-between px-3">
              <div className="flex items-center">
                <SidebarTrigger>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 min-h-[44px] min-w-[44px]"
                    ariaLabel="Toggle navigation menu"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SidebarTrigger>
                <h2 className="ml-3 text-base md:text-lg font-semibold truncate">ErpMax</h2>
              </div>
              <div className="flex items-center gap-1" role="toolbar" aria-label="Header actions">
                <NotificationBell />
                <QuickActions />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="h-9 w-9 transition-all hover:scale-105 min-h-[44px] min-w-[44px]"
                  ariaLabel={settings?.dark_mode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {settings?.dark_mode ? (
                    <Sun className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Moon className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>
                <UserDropdown />
              </div>
            </div>
          </header>

          {/* Desktop Header */}
          <header 
            className="sticky top-0 z-50 hidden lg:flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4"
            role="banner"
            aria-label="Desktop header"
          >
            <div className="flex items-center gap-2">
              <SidebarTrigger>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 min-h-[44px] min-w-[44px]"
                  ariaLabel="Toggle navigation menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SidebarTrigger>
            </div>
            
            <div className="flex items-center gap-2" role="toolbar" aria-label="Header actions">
              <NotificationBell />
              <QuickActions />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-9 w-9 transition-all hover:scale-105 min-h-[44px] min-w-[44px]"
                ariaLabel={settings?.dark_mode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {settings?.dark_mode ? (
                  <Sun className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Moon className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
              <UserDropdown />
            </div>
          </header>

          {/* Main Content */}
          <main 
            id="main-content"
            className="flex-1 overflow-y-auto" 
            role="main"
            aria-label="Main content area"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
