import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useLocation, Outlet } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const firstName = user?.full_name?.split(" ")[0] || user?.username || "Operator";
  const initial = firstName[0].toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#050505] text-white relative overflow-hidden font-sans">
        
        {/* ─── Premium Background ─── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Aurora Mesh Background */}
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="absolute top-[-50%] left-[-20%] w-[90vw] h-[90vw] bg-primary/[0.04] rounded-full blur-[150px] animate-orb-float" />
          <div className="absolute bottom-[-30%] right-[-20%] w-[70vw] h-[70vw] bg-[#00D6FF]/[0.03] rounded-full blur-[130px] animate-orb-float" style={{ animationDelay: "-7s" }} />
          <div className="absolute top-[30%] right-[10%] w-[50vw] h-[50vw] bg-[#00D6FF]/[0.02] rounded-full blur-[140px] animate-orb-float" style={{ animationDelay: "-14s" }} />
          
          {/* Subtle Grid */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "80px 80px"
            }} 
          />
        </div>

        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
            {/* ─── Compact Glass Header ─── */}
            <motion.header 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-16 flex items-center justify-between px-6 relative sticky top-0 z-40"
            >
              {/* Glass Background */}
              <div className="absolute inset-0 bg-[#050505]/70 backdrop-blur-2xl border-b border-white/[0.05]" />
              
              {/* Top Glow */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
              
              <div className="flex items-center gap-4 relative z-10">
                <SidebarTrigger className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/[0.05] rounded-lg" />
                <div className="h-5 w-[1px] bg-white/10" />
                <span className="text-[12px] text-white/40 font-medium">
                  Welcome, <span className="text-white/90 font-bold">{firstName}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input 
                    placeholder="Search..." 
                    className="h-9 w-48 pl-9 bg-white/[0.03] border-white/[0.05] text-[11px] placeholder:text-white/20 focus:border-primary/20 rounded-xl"
                  />
                </div>
                
                <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] relative">
                  <Bell className="h-4 w-4 text-white/30" />
                  {/* Notification Red Dot */}
                  <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
                </Button>
                
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-[#00D6FF]/20 flex items-center justify-center text-sm font-bold text-primary border border-primary/10">
                  {initial}
                </div>
              </div>
            </motion.header>

            {/* ─── Content Area ─── */}
            <main className="flex-1 p-6 overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="max-w-[1600px] mx-auto"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </SidebarProvider>
  );
}
