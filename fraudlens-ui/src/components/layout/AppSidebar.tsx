import {
  BarChart3, Cpu, Shield, LogOut, FlaskConical,
  LayoutDashboard, Send, Clock, UserCircle,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Analytics", url: "/admin", icon: BarChart3 },
  { title: "Models", url: "/admin/models", icon: Cpu },
  { title: "Testing", url: "/admin/testing", icon: FlaskConical },
];

const userItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Send Money", url: "/dashboard/send", icon: Send },
  { title: "History", url: "/dashboard/history", icon: Clock },
  { title: "Profile", url: "/dashboard/profile", icon: UserCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminItems : userItems;
  const groupLabel = isAdmin ? "Admin" : "Menu";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="pt-4">
        <div className="px-4 pb-4 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          {!collapsed && <span className="text-lg font-bold gradient-text">FraudLens</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">
            {!collapsed && groupLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin" || item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50 rounded-lg transition-colors"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={handleLogout}
                className="w-full flex items-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Logout</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
