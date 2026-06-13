import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Clock, Calendar, LogOut, Eye, EyeOff, Check, Settings, Fingerprint, Lock, Activity, ArrowRight, UserCircle, Database, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  TiltCard, MagneticButton, GlowBorder, AnimatedCounter, RippleButton 
} from "@/components/ui/premium-interactions";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] }
  }
};

export default function ProfilePage() {
  const { user, token, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [panCard, setPanCard] = useState(user?.pan_card || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.two_fa_enabled || false);
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = (user?.full_name || user?.username || "?")[0].toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";
  const lastLogin = user?.latest_login
    ? new Date(user.latest_login).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/users/me", { full_name: fullName, username, pan_card: panCard, gender, two_fa_enabled: twoFAEnabled }, token);
      await refreshUser();
      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1200px] mx-auto space-y-12 pb-20"
    >
      {/* ─── Profile Header ─── */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <GlowBorder color="#00D6FF" className="rounded-[48px]">
          <div className="glass-hero p-10 lg:p-14 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-48 -mt-48" />
            
            <div className="relative z-10">
               <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                  <div className="h-40 w-40 rounded-[48px] bg-gradient-to-br from-primary to-[#00D6FF] flex items-center justify-center text-6xl font-black text-white shadow-[0_20px_50px_rgba(0,80,255,0.3)] group-hover:shadow-[0_20px_80px_rgba(0,128,255,0.5)] transition-all duration-500">
                    {initial}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-[#00FF94] border-8 border-[#020202] flex items-center justify-center">
                    <Check className="h-6 w-6 text-black" />
                  </div>
               </motion.div>
            </div>

            <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left">
               <div className="space-y-1">
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase leading-none">{user?.full_name || user?.username}</h1>
                  <p className="text-[14px] font-black uppercase tracking-[0.4em] text-white/20">Vector Identification: @{user?.username}</p>
               </div>
               
               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                  <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                     <Calendar className="h-3.5 w-3.5 text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Member:</span>
                     <span className="text-[10px] font-bold text-white">{memberSince}</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#00FF94]/5 border border-[#00FF94]/20">
                     <div className="h-2 w-2 rounded-full bg-[#00FF94] shadow-[0_0_10px_#00FF94] animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF94]">Status: Active</span>
                  </div>
               </div>
            </div>

            <div className="w-full lg:w-auto relative z-10">
               <TiltCard intensity={15}>
                  <div className="glass-card-float p-8 rounded-[40px] border border-white/10 min-w-[280px]">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Neural Balance</span>
                     <div className="mt-4 flex items-baseline gap-3">
                        <span className="text-4xl font-black tracking-tighter text-white">₹<AnimatedCounter value={user?.balance ?? 0} /></span>
                        <Zap className="h-5 w-5 text-primary" />
                     </div>
                     <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ x: ["-100%", "100%"] }} 
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent" 
                        />
                     </div>
                  </div>
               </TiltCard>
            </div>
          </div>
        </GlowBorder>
      </motion.div>

      {/* ─── Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* Identification Settings */}
         <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="glass-card-float p-10 lg:p-14 rounded-[56px] border border-white/5 space-y-10">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                     <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-[12px] uppercase tracking-[0.5em] font-black text-white/40">Vector Identity</h3>
               </div>

                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <Label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-2">Username</Label>
                         <input
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           className="w-full h-16 px-6 bg-white/[0.03] border border-white/5 rounded-[24px] text-white font-bold outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all"
                         />
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-2">Full Name</Label>
                         <input
                           value={fullName}
                           onChange={(e) => setFullName(e.target.value)}
                           className="w-full h-16 px-6 bg-white/[0.03] border border-white/5 rounded-[24px] text-white font-bold outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all"
                         />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-2">PAN Descriptor</Label>
                      <input
                        value={panCard}
                        onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                        maxLength={10}
                        className="w-full h-16 px-6 bg-white/[0.03] border border-white/5 rounded-[24px] text-white font-bold uppercase tracking-[0.2em] outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all"
                      />
                   </div>

                  <div className="space-y-3">
                     <Label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-2">Gender Class</Label>
                     <div className="flex gap-4">
                        {["male", "female", "other"].map((g) => (
                          <button
                            key={g}
                            onClick={() => setGender(g)}
                            className={`flex-1 h-16 rounded-[24px] text-[10px] uppercase tracking-[0.3em] font-black transition-all border ${
                              gender === g 
                                ? "bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.1)]" 
                                : "bg-white/[0.02] border-white/5 text-white/20 hover:text-white/40"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="pt-4">
                     <MagneticButton strength={0.1}>
                        <RippleButton 
                          onClick={handleSave}
                          disabled={saving}
                          className="w-full h-18 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-[28px] shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           {saving ? "Updating..." : "Commit Changes"}
                           {!saving && <ArrowRight className="h-4 w-4" />}
                        </RippleButton>
                     </MagneticButton>
                  </div>
               </div>
            </div>
         </motion.div>

         {/* Security & System Info */}
         <motion.div variants={itemVariants} className="lg:col-span-5 space-y-10">
            {/* Security Pulse */}
            <div className="glass-card-float p-10 rounded-[56px] border border-white/5 space-y-8">
               <div className="flex items-center gap-4">
                  <Shield className="h-6 w-6 text-[#00FF94]" />
                  <h3 className="text-[12px] uppercase tracking-[0.5em] font-black text-white/40">Security Matrix</h3>
               </div>
               
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 rounded-[32px] bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-5">
                         <div className="h-12 w-12 rounded-2xl bg-[#00FF94]/10 flex items-center justify-center border border-[#00FF94]/20">
                            <Fingerprint className="h-6 w-6 text-[#00FF94]" />
                         </div>
                         <div>
                            <p className="text-[13px] font-black text-white uppercase tracking-tight">Biometric Auth</p>
                            <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mt-0.5">SHA-512 Protocol</p>
                         </div>
                      </div>
                      <div className="h-7 w-12 rounded-full bg-[#00FF94]/20 border border-[#00FF94]/30 relative">
                         <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#00FF94] shadow-[0_0_15px_#00FF94]" />
                      </div>
                   </div>

                   {/* 2FA Toggle */}
                   <div className="flex items-center justify-between p-6 rounded-[32px] bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-5">
                         <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all ${
                           twoFAEnabled ? "bg-[#0050FF]/10 border-[#0050FF]/20" : "bg-white/[0.03] border-white/5"
                         }`}>
                            <Shield className={`h-6 w-6 transition-colors ${twoFAEnabled ? "text-[#0050FF]" : "text-white/20"}`} />
                         </div>
                         <div>
                            <p className="text-[13px] font-black text-white uppercase tracking-tight">Two-Factor Auth</p>
                            <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mt-0.5">
                              {twoFAEnabled ? "Enabled" : "Disabled"}
                            </p>
                         </div>
                      </div>
                      <button
                        onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                        className={`h-7 w-12 rounded-full border transition-all relative ${
                          twoFAEnabled ? "bg-[#0050FF]/20 border-[#0050FF]/30" : "bg-white/[0.03] border-white/5"
                        }`}
                      >
                        <div className={`absolute top-1 h-5 w-5 rounded-full transition-all shadow-[0_0_15px_rgba(0,80,255,0.5)] ${
                          twoFAEnabled ? "right-1 bg-[#0050FF]" : "left-1 bg-white/20"
                        }`} />
                      </button>
                   </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-3">
                        <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Encryption</span>
                        <p className="text-sm font-bold text-[#00FF94] flex items-center gap-2">
                           <Lock className="h-4 w-4" />
                           AES-256
                        </p>
                     </div>
                     <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-3">
                        <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Access Tier</span>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                           <Shield className="h-4 w-4" />
                           Node-7
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Termination Controls */}
            <div className="glass-card-float p-10 rounded-[56px] border border-white/5 space-y-8 flex flex-col justify-between">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <Activity className="h-6 w-6 text-white/20" />
                     <h3 className="text-[12px] uppercase tracking-[0.5em] font-black text-white/40">Active Session</h3>
                  </div>
                  <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5">
                     <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Last Authorized Entry</p>
                     <p className="text-[11px] font-bold text-white">{lastLogin}</p>
                  </div>
               </div>
               
               <MagneticButton strength={0.1}>
                  <button 
                    onClick={handleLogout}
                    className="w-full h-18 rounded-[28px] border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4"
                  >
                     <LogOut className="h-5 w-5" />
                     Terminate Session
                  </button>
               </MagneticButton>
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
}
