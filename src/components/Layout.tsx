import { NavLink, useLocation } from "react-router-dom";
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
  Building2
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
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 md:p-6 border-b border-sidebar-border">
          <h1 className={`text-xl md:text-2xl font-bold text-sidebar-foreground transition-all ${!open && "hidden"}`}>
            ErpMax
          </h1>
          {!open && (
            <h1 className="text-lg md:text-xl font-bold text-sidebar-foreground text-center">E</h1>
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
                      <NavLink to={item.path}>
                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
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

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex flex-col flex-1 w-full">
          {/* Mobile Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
            <div className="flex h-14 items-center px-3">
              <SidebarTrigger>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
              <h2 className="ml-3 text-base md:text-lg font-semibold truncate">ErpMax</h2>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="sticky top-0 z-50 hidden lg:flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3">
            <SidebarTrigger>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
