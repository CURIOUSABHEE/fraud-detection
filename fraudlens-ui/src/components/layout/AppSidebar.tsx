import {
  LayoutDashboard, Send, History, User, BarChart3, Cpu, Shield, LogOut, Zap, FlaskConical
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "@/components/ui/premium-interactions";

const userItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transfer", url: "/dashboard/send", icon: Send },
  { title: "Ledger", url: "/dashboard/history", icon: History },
  { title: "Identity", url: "/dashboard/profile", icon: User },
];

const adminItems = [
  { title: "Analytics", url: "/admin", icon: BarChart3 },
  { title: "Models", url: "/admin/models", icon: Cpu },
  { title: "Testing", url: "/admin/testing", icon: FlaskConical },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout, user } = useAuth();
  const isAdmin = user?.isAdmin === true;
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which nav to show based on current route
  const isAdminRoute = location.pathname.startsWith("/admin");
  const showUserNav = !isAdminRoute;
  const showAdminNav = isAdminRoute && isAdmin;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-white/[0.05] bg-[#0a0a0f]/80 backdrop-blur-2xl relative z-50 fixed left-0 top-0 h-screen shadow-[0_0_60px_rgba(0,80,255,0.03)]"
    >
      {/* ─── Glass Effect Overlay ─── */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-primary/[0.05] to-transparent pointer-events-none blur-3xl" />
      
      {/* ─── Subtle Border Glow ─── */}
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none" />

      <SidebarContent className="bg-transparent relative z-10 scrollbar-none">
        {/* ─── Compact Logo Section ─── */}
        <div className={`flex items-center gap-3 px-5 py-6 ${collapsed ? "justify-center px-0" : ""}`}>
          <MagneticButton strength={0.15}>
            <motion.div 
              whileHover={{ scale: 1.08, rotate: 3 }}
              className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-br from-white to-white/90 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.3)] relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="h-5 w-5 text-black relative z-10" />
            </motion.div>
          </MagneticButton>
          
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-lg font-black tracking-tighter text-white leading-none">
                Fraud<span className="text-primary">Lens</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.35em] text-white/15 font-bold mt-0.5">Intelligence</span>
            </motion.div>
          )}
        </div>

        {/* ─── User Navigation ─── */}
        {showUserNav && (
          <SidebarGroup className="px-3 mt-2">
            {!collapsed && (
              <SidebarGroupLabel className="px-3 mb-3 text-[9px] uppercase tracking-[0.4em] font-black text-white/8">
                Operations
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {userItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-11 hover:bg-transparent active:bg-transparent">
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className={({ isActive }) => `
                          relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 group
                          ${isActive
                            ? "bg-primary/[0.08] border border-primary/10 shadow-[0_0_20px_rgba(0,80,255,0.08)]"
                            : "hover:bg-white/[0.03] border border-transparent hover:border-white/5"
                          }
                        `}
                      >
                        {({ isActive }) => (
                          <>
                            <MagneticButton strength={0.25}>
                              <div className={`relative h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? "bg-primary/[0.15] shadow-[0_0_12px_rgba(0,80,255,0.2)]"
                                  : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                              }`}>
                                {/* Neon glow for active */}
                                {isActive && (
                                  <motion.div
                                    layoutId="activeGlow"
                                    className="absolute inset-0 rounded-lg bg-primary/5"
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                  />
                                )}
                                <item.icon className={`h-4 w-4 transition-all duration-300 ${
                                  isActive ? "text-primary scale-110" : "text-white/30 group-hover:text-white/50"
                                }`} />
                              </div>
                            </MagneticButton>

                            {!collapsed && (
                              <span className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                                isActive ? "text-white translate-x-0.5" : "text-white/25 group-hover:text-white/40"
                              }`}>
                                {item.title}
                              </span>
                            )}

                            {/* Blue neon indicator */}
                            {isActive && !collapsed && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_#0050FF,0_0_20px_#0050FF]"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* ─── Admin Section ─── */}
        {showAdminNav && (
          <SidebarGroup className="px-3 mt-6">
            {!collapsed && (
              <SidebarGroupLabel className="px-3 mb-3 text-[9px] uppercase tracking-[0.4em] font-black text-white/8">
                Core Systems
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-11 hover:bg-transparent active:bg-transparent">
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className={({ isActive }) => `
                          relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 group
                          ${isActive
                            ? "bg-[#A855F7]/[0.08] border border-[#A855F7]/10 shadow-[0_0_20px_rgba(168,85,247,0.08)]"
                            : "hover:bg-white/[0.03] border border-transparent hover:border-white/5"
                          }
                        `}
                      >
                        {({ isActive }) => (
                          <>
                            <MagneticButton strength={0.25}>
                              <div className={`relative h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? "bg-[#A855F7]/[0.15] shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                                  : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                              }`}>
                                {isActive && (
                                  <motion.div
                                    layoutId="adminActiveGlow"
                                    className="absolute inset-0 rounded-lg bg-[#A855F7]/5"
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                  />
                                )}
                                <item.icon className={`h-4 w-4 transition-all duration-300 ${
                                  isActive ? "text-[#A855F7] scale-110" : "text-white/30 group-hover:text-white/50"
                                }`} />
                              </div>
                            </MagneticButton>

                            {!collapsed && (
                              <span className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                                isActive ? "text-white translate-x-0.5" : "text-white/25 group-hover:text-white/40"
                              }`}>
                                {item.title}
                              </span>
                            )}

                            {isActive && !collapsed && (
                              <motion.div
                                layoutId="adminIndicator"
                                className="ml-auto h-1.5 w-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7,0_0_20px_#A855F7]"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* ─── Neural Status (Admin Only) ─── */}
        {showAdminNav && !collapsed && (
          <div className="px-5 mt-auto mb-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2.5 mb-3">
                <div className="relative">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00D278] shadow-[0_0_8px_#00D278]" />
                  <div className="absolute inset-0 h-1.5 w-1.5 rounded-full bg-[#00D278] animate-ping opacity-50" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-white/30">Neural Sync</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-black text-white/15 uppercase tracking-widest">
                  <span>Capacity</span>
                  <span className="text-primary/60">99.7%</span>
                </div>
                <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "99.7%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary/40 to-[#00D6FF]/40"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>

      {/* ─── Premium Footer ─── */}
      <SidebarFooter className="p-4 bg-transparent relative z-10 border-t border-white/[0.03]">
        <MagneticButton strength={0.1}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/[0.08] border border-transparent hover:border-red-500/10 transition-all duration-300 group ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            {!collapsed && (
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Terminate</span>
            )}
          </button>
        </MagneticButton>
      </SidebarFooter>
    </Sidebar>
  );
}
