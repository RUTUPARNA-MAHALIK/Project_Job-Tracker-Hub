import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  Users,
  FileText,
  LogOut,
  Menu
} from "lucide-react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Applications", href: "/applications", icon: Briefcase },
  { name: "Interviews", href: "/interviews", icon: CalendarDays },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Resumes", href: "/resumes", icon: FileText },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background/50">
        <Sidebar>
          <SidebarContent className="flex flex-col h-full bg-card border-r border-border">
            <div className="p-6">
              <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                TrackIt
              </h2>
            </div>
            
            <SidebarGroup className="flex-1">
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-6">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-3 gap-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className={`w-full justify-start rounded-xl transition-all duration-200 ${
                            isActive 
                              ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <Link href={item.href} className="flex items-center gap-3 px-4 py-2.5">
                            <item.icon className="w-5 h-5" />
                            {item.name}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="p-4 mt-auto border-t border-border">
              <div className="flex items-center gap-3 mb-4 px-2">
                <img 
                  src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-primary/20"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-colors"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex-1 flex justify-end">
              {/* Additional header actions could go here */}
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 kanban-scroll">
            <div className="mx-auto max-w-7xl w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
