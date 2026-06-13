import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowRight, User, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", mpin: "" });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSignup = async () => {
    if (!form.name.trim()) return;
    if (!form.username.trim()) return;
    if (form.mpin.length !== 6) return;
    
    setLoading(true);
    try {
      await signup({
        username: form.username.trim(),
        full_name: form.name.trim(),
        mpin: form.mpin,
      });
      setStep("success");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden selection:bg-white/20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[15%] w-[35vw] h-[35vh] bg-[#0050FF]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[25vw] h-[25vh] bg-[#00D6FF]/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
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
            {step === "form" ? (
              <>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">Create Account</h1>
                <p className="text-white/40 text-[11px] uppercase tracking-[0.4em] font-bold">Join the FraudLens Network</p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">Welcome Aboard</h1>
                <p className="text-white/40 text-[11px] uppercase tracking-[0.4em] font-bold">Redirecting to Dashboard...</p>
              </>
            )}
          </div>

          <div className="glass-card rounded-[32px] p-10 relative border-white/5">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            {step === "form" ? (
              <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 ml-1">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input 
                      value={form.name} 
                      onChange={(e) => update("name", e.target.value)} 
                      placeholder="John Smith" 
                      className="h-14 bg-white/[0.02] border-white/5 focus:border-white/20 text-white rounded-2xl pl-12 placeholder:text-white/10" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 ml-1">Username</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input 
                      value={form.username} 
                      onChange={(e) => update("username", e.target.value)} 
                      placeholder="Choose a username" 
                      className="h-14 bg-white/[0.02] border-white/5 focus:border-white/20 text-white rounded-2xl pl-12 placeholder:text-white/10" 
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
                      value={form.mpin} 
                      onChange={(e) => update("mpin", e.target.value)} 
                      placeholder="Enter 6-digit MPIN" 
                      className="h-14 bg-white/[0.02] border-white/5 focus:border-white/20 text-white rounded-2xl pl-12 placeholder:text-white/10" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full h-14 bg-white text-black font-black uppercase text-[12px] tracking-[0.3em] rounded-2xl hover:bg-white/90 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Account"}
                  {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 relative z-10 text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/10 mb-4"
                >
                  <CheckCircle className="h-10 w-10 text-white" />
                </motion.div>
                <p className="text-white/60 text-sm">Account created successfully!</p>
              </motion.div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20 hover:text-white transition-colors">
              Already have an account? Log in
            </Link>
          </div>

          <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm text-center">
            <p className="text-[10px] text-white/25 font-medium">
              This is a demo. Any credentials will work for testing.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
