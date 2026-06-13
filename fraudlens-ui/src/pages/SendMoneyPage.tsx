import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, MapPin, Globe, AlertCircle, CheckCircle, XCircle, User, Shield, Zap, ArrowRight, Lock, Check, Sparkles, Database, Activity, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  TiltCard, MagneticButton, GlowBorder, AnimatedCounter
} from "@/components/ui/premium-interactions";

interface SendResult {
  message: string;
  transaction: {
    id: string;
    amount: number;
    recipient: string;
    recipient_name?: string;
    status: string;
    is_fraud: boolean;
    fraud_score?: number;
    risk_factors?: string[];
    new_balance: number;
  };
}

interface UserSuggestion {
  username: string;
  full_name: string | null;
}

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

export default function SendMoneyPage() {
  const { token, refreshUser } = useAuth();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [mpin, setMpin] = useState("");
  const [geoInfo, setGeoInfo] = useState<{ lat?: number; long?: number; label: string }>({ label: "Detecting…" });
  const [mpinOpen, setMpinOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) { setGeoInfo({ label: "Not available" }); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeoInfo({ lat: pos.coords.latitude, long: pos.coords.longitude, label: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}` }),
      () => setGeoInfo({ label: "Denied" })
    );
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    setSelectedUser(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await api.get<UserSuggestion[]>(`/users/search?q=${encodeURIComponent(value.trim())}`, token);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const selectSuggestion = (u: UserSuggestion) => {
    setRecipient(u.username);
    setSelectedUser(u);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const openConfirmation = () => {
    if (!recipient.trim()) { toast.error("Enter recipient username"); return; }
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    setMpin("");
    setMpinOpen(true);
  };

  const handleSend = async () => {
    if (mpin.length !== 6) { toast.error("Enter your 6-digit MPIN"); return; }
    setLoading(true);
    try {
      const data = await api.post<SendResult>("/transactions/send", {
        recipient_username: recipient.trim(),
        amount: Number(amount),
        description: description.trim() || undefined,
        mpin,
        sender_lat: geoInfo.lat,
        sender_long: geoInfo.long,
      }, token);

      setMpinOpen(false);
      setResult(data);
      await refreshUser();
      setRecipient(""); setAmount(""); setDescription(""); setSelectedUser(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1200px] mx-auto space-y-12 pb-20"
    >
      {/* ─── Header Section ─── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-6 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Send className="h-3.5 w-3.5 text-primary" />
             </div>
             <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white/20">Secured Transfer Node</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-none">
            Move <span className="gradient-text">Capital</span>
          </h1>
          <p className="text-white/40 text-sm font-medium max-w-xl">
            Real-time peer-to-peer settlement via Neural Gateway. All outbound vectors
            are cross-validated against 1,200+ fraud indicators before final authorization.
          </p>
        </div>

        <div className="flex gap-4">
           <div className="px-6 py-4 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest font-black text-white/20">Operational Status</span>
              <div className="flex items-center gap-3 mt-1">
                 <div className="h-2 w-2 rounded-full bg-[#00FF94] shadow-[0_0_10px_#00FF94] animate-pulse" />
                 <span className="text-xl font-black text-white tracking-tighter">NOMINAL</span>
              </div>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

        {/* ─── Transfer Form ─── */}
        <motion.div variants={itemVariants} className="xl:col-span-7">
          <TiltCard intensity={5}>
            <GlowBorder color="#0050FF" className="rounded-[48px]">
              <div className="p-10 lg:p-14 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                {/* Result Banner */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className={`p-6 rounded-[32px] border flex items-start gap-5 relative z-10 ${
                        result.transaction.is_fraud
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-[#00FF94]/10 border-[#00FF94]/20 text-[#00FF94]"
                      }`}
                    >
                      {result.transaction.is_fraud ? <XCircle className="h-6 w-6 mt-1" /> : <CheckCircle className="h-6 w-6 mt-1" />}
                      <div className="flex-1 space-y-3">
                        <p className="font-black uppercase tracking-widest text-[11px] mb-1">{result.transaction.is_fraud ? "Alert: Vector Blocked" : "Vector Settled"}</p>
                        <p className="text-sm font-medium text-white/70">{result.message}</p>

                        {/* Fraud Analysis Details */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                          {result.transaction.fraud_score !== undefined && (
                            <div className="p-3 rounded-xl bg-white/[0.02]">
                              <p className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Fraud Score</p>
                              <p className="text-lg font-black text-white mt-1">{result.transaction.fraud_score}%</p>
                            </div>
                          )}
                          <div className="p-3 rounded-xl bg-white/[0.02]">
                            <p className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Status</p>
                            <p className={`text-lg font-black mt-1 ${result.transaction.status === "COMPLETED" ? "text-[#00FF94]" : "text-orange-400"}`}>
                              {result.transaction.status}
                            </p>
                          </div>
                        </div>

                        {/* Risk Factors */}
                        {result.transaction.risk_factors && result.transaction.risk_factors.length > 0 && (
                          <div className="pt-2">
                            <p className="text-[9px] uppercase tracking-wider text-white/30 font-bold mb-2">Risk Factors</p>
                            <div className="flex flex-wrap gap-2">
                              {result.transaction.risk_factors.map((factor, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button onClick={() => setResult(null)} className="text-white/20 hover:text-white transition-colors">
                        <XCircle className="h-5 w-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-8 relative z-10">
                  {/* Recipient Autocomplete */}
                  <div className="space-y-4" ref={wrapperRef}>
                    <Label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 ml-2">Recipient Identifier</Label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                         <User className={`h-5 w-5 transition-colors ${selectedUser ? "text-primary" : "text-white/20"}`} />
                         <div className="h-5 w-[1px] bg-white/10" />
                      </div>
                      <input
                        value={recipient}
                        onChange={(e) => handleRecipientChange(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="Search system nodes..."
                        className={`w-full h-20 pl-16 pr-16 bg-white/[0.03] border rounded-[28px] text-white text-lg font-bold outline-none transition-all ${
                          selectedUser ? "border-primary/40 bg-primary/5" : "border-white/5 focus:border-white/20 focus:bg-white/[0.05]"
                        }`}
                        autoComplete="off"
                      />

                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                         {searchLoading ? (
                           <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                         ) : selectedUser ? (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                              <Check className="h-4 w-4 text-primary" />
                            </motion.div>
                         ) : null}
                      </div>

                      <AnimatePresence>
                        {showSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            className="absolute z-50 top-full mt-4 w-full rounded-[32px] border border-white/10 bg-[#0a0a0a] shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl"
                          >
                            {suggestions.map((u) => (
                              <button
                                key={u.username}
                                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(u); }}
                                className="w-full flex items-center gap-5 px-8 py-5 hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0 group/item"
                              >
                                <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover/item:border-primary/40 transition-all">
                                  <User className="h-5 w-5 text-white/20 group-hover/item:text-primary transition-colors" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-black text-white uppercase tracking-wider">{u.username}</p>
                                  {u.full_name && <p className="text-xs text-white/20 font-medium">{u.full_name}</p>}
                                </div>
                                <ChevronRight className="ml-auto h-4 w-4 text-white/10 group-hover/item:text-white transition-all group-hover/item:translate-x-1" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Amount Entry */}
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 ml-2">Capital Allocation (₹)</Label>
                    <div className="relative">
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-white/20 group-focus-within:text-white transition-colors">₹</div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-28 pl-16 bg-white/[0.03] border border-white/5 rounded-[32px] text-white text-5xl font-black outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all placeholder:text-white/5 tracking-tighter"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 ml-2">Transfer Manifest</Label>
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Specify purpose of settlement..."
                      className="w-full h-16 px-8 bg-white/[0.03] border border-white/5 rounded-[24px] text-white font-medium outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  {/* AI Assurance Card */}
                  <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20 flex items-start gap-6 group">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                        <Shield className="h-6 w-6 text-primary" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight mb-1">Neural Guard v4.2 Active</p>
                        <p className="text-xs text-white/40 leading-relaxed font-medium">
                          Our models will analyze behavior patterns, device fingerprints, and graph anomalies
                          before authorizing this settlement. Verified SHA-256 encryption active.
                        </p>
                     </div>
                  </div>

                  <MagneticButton strength={0.1}>
                    <button
                      onClick={openConfirmation}
                      className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.4em] text-[12px] rounded-[32px] shadow-[0_20px_60px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 group hover:scale-[1.01] transition-transform"
                    >
                       Initiate Secure Transfer
                       <Zap className="h-5 w-5 fill-black group-hover:animate-pulse" />
                    </button>
                  </MagneticButton>
                </div>
              </div>
            </GlowBorder>
          </TiltCard>
        </motion.div>

        {/* ─── Sidebar Details ─── */}
        <motion.div variants={itemVariants} className="xl:col-span-5 space-y-8">
           {/* Context Card */}
           <div className="glass-card-float p-10 rounded-[48px] border border-white/5 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                 </div>
                 <h3 className="text-[11px] uppercase tracking-[0.5em] font-black text-white/40">Network Context</h3>
              </div>

              <div className="space-y-6">
                {[
                  { label: "Origin Node", val: geoInfo.label, icon: MapPin, col: "#0050FF" },
                  { label: "IP Protocol", val: "L7 Encrypted", icon: Shield, col: "#00D6FF" },
                  { label: "Settlement Tier", val: "Alpha-7 (Immediate)", icon: Activity, col: "#0050FF" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5 p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                     <item.icon className="h-5 w-5" style={{ color: item.col }} />
                     <div>
                        <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-white mt-0.5">{item.val}</p>
                     </div>
                  </div>
                ))}
              </div>
           </div>

           {/* Security Visual */}
           <div className="glass-card-float p-10 rounded-[48px] border border-white/5 flex flex-col items-center text-center">
              <div className="relative h-32 w-32 mb-8">
                 <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-primary/20"
                 />
                 <div className="absolute inset-4 rounded-full border border-primary/10 flex items-center justify-center bg-primary/5">
                    <Lock className="h-8 w-8 text-primary" />
                 </div>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-2">Immutable Ledger Sync</h4>
              <p className="text-white/20 text-xs font-medium leading-relaxed">
                 Every transaction generates a unique cryptographic proof stored across 12 distributed nodes
                 for audit transparency and zero-repudiation.
              </p>
           </div>
        </motion.div>
      </div>

      {/* ─── MPIN Confirmation Dialog ─── */}
      <Dialog open={mpinOpen} onOpenChange={setMpinOpen}>
        <DialogContent className="sm:max-w-md bg-[#020202] border border-white/10 rounded-[48px] p-0 overflow-hidden outline-none">
          <div className="p-10 lg:p-14 space-y-10 relative">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <DialogHeader className="space-y-4">
              <div className="h-20 w-20 rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-6">
                 <Lock className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-3xl font-black text-white text-center uppercase tracking-tighter">Authorize Transfer</DialogTitle>
              <DialogDescription className="text-center">
                <span className="text-white font-bold text-xl tracking-tighter">₹{Number(amount).toLocaleString()}</span>
                <span className="text-white/20 block text-[10px] uppercase tracking-widest mt-2">Target Node: {selectedUser?.username || recipient}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-10">
               <div className="flex justify-center gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: i < mpin.length ? 1.2 : 1,
                        backgroundColor: i < mpin.length ? "#0050FF" : "rgba(255,255,255,0.05)"
                      }}
                      className={`h-4 w-4 rounded-full transition-all ${i < mpin.length ? "shadow-[0_0_20px_#0050FF]" : ""}`}
                    />
                  ))}
               </div>

               <input
                 type="password"
                 value={mpin}
                 onChange={(e) => setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                 className="absolute inset-0 opacity-0 cursor-default"
                 autoFocus
                 onKeyDown={(e) => e.key === "Enter" && handleSend()}
               />

               <div className="grid grid-cols-2 gap-4 pt-4">
                 <button onClick={() => setMpinOpen(false)} className="h-16 rounded-[24px] border border-white/5 bg-white/[0.02] text-white/30 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Cancel</button>
                 <button
                   onClick={handleSend}
                   disabled={loading || mpin.length !== 6}
                   className="h-16 rounded-[24px] bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-20"
                 >
                    {loading ? "Syncing..." : "Authorize"}
                    {!loading && <Check className="h-4 w-4" />}
                 </button>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
