import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowRight, Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }
    if (!mpin || mpin.length !== 6) {
      setError("Please enter a 6-digit MPIN");
      return;
    }
    
    setLoading(true);
    try {
      const loggedInUser = await login(username, mpin);
      if (loggedInUser.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden selection:bg-white/20">
      <Navbar />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vh] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vh] bg-blue-400/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="w-full max-w-[440px]"
        >
          <div className="text-center mb-10">
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="inline-flex items-center justify-center h-20 w-20 rounded-[28px] bg-white text-black mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            >
              <Shield className="h-10 w-10" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">Secure Access</h1>
            <p className="text-white/40 text-[11px] uppercase tracking-[0.4em] font-bold">Enter your credentials to continue</p>
          </div>

          <div className="glass-card rounded-[32px] p-10 relative group border-white/5">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/[0.05] to-transparent pointer-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 ml-1">Username</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    placeholder="Enter your username"
                    className="h-14 bg-white/[0.02] border-white/5 focus:border-white/20 text-white rounded-2xl pl-12 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 ml-1">MPIN (6 digits)</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                    type="password"
                    maxLength={6}
                    value={mpin}
                    onChange={(e) => { setMpin(e.target.value); setError(""); }}
                    placeholder="••••••"
                    className="h-14 bg-white/[0.02] border-white/5 focus:border-white/20 text-white rounded-2xl pl-12 transition-all placeholder:text-white/10"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/20"
                >
                  <AlertCircle className="h-4 w-4 text-[#FF3B3B] flex-shrink-0" />
                  <span className="text-[11px] text-[#FF3B3B]/90 font-medium">{error}</span>
                </motion.div>
              )}

              <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-14 bg-white text-black font-black uppercase text-[12px] tracking-[0.3em] rounded-2xl hover:bg-white/90 transition-all transform active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Secure Login"}
                {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center">
            <Link to="/signup" className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20 hover:text-white transition-colors">
              Don't have an account? Sign up
            </Link>
          </div>

<div className="mt-12 p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm text-center">
             <p className="text-[10px] text-white/30 font-medium">
                Use <span className="text-white/50">abhi</span> with <span className="text-white/50">123123</span> for admin access
              </p>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
