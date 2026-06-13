import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight, ArrowDownLeft, Search, ChevronDown, Shield, AlertTriangle,
  Clock, Filter, Zap, CheckCircle, XCircle, Lock, Activity, ChevronRight,
  Download, FilterX, ArrowUpDown, Fingerprint
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { 
  TiltCard, MagneticButton, GlowBorder, AnimatedCounter, RippleButton 
} from "@/components/ui/premium-interactions";

interface Counterparty { username: string; full_name?: string; }
interface TxRecord {
  _id: string;
  transaction_type: "DEBIT" | "CREDIT";
  transaction_amount: number;
  status: string;
  description?: string;
  timestamp: string;
  is_fraud: boolean;
  counterparty?: Counterparty;
}

const statusMap: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  success: { label: "SECURED", color: "#00FF94", bg: "rgba(0,255,148,0.05)", border: "rgba(0,255,148,0.15)", icon: CheckCircle },
  pending: { label: "PENDING", color: "#FFA500", bg: "rgba(255,165,0,0.05)", border: "rgba(255,165,0,0.15)", icon: Clock },
  fraud:   { label: "BLOCKED", color: "#FF3B3B", bg: "rgba(255,59,59,0.05)", border: "rgba(255,59,59,0.15)", icon: AlertTriangle },
  failed:  { label: "FAILED",  color: "#6B7280", bg: "rgba(107,114,128,0.05)", border: "rgba(107,114,128,0.15)", icon: XCircle },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
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

export default function HistoryPage() {
  const { token } = useAuth();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: allTx = [], isLoading } = useQuery<TxRecord[]>({
    queryKey: ["transactions"],
    queryFn: () => api.get<TxRecord[]>("/transactions/my", token),
    enabled: !!token,
  });

  const filtered = allTx.filter((t) => {
    const name = t.counterparty?.full_name || t.counterparty?.username || "";
    const matchFilter =
      filter === "all" ||
      (filter === "sent" && t.transaction_type === "DEBIT") ||
      (filter === "received" && t.transaction_type === "CREDIT") ||
      (filter === "flagged" && t.is_fraud);
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1200px] mx-auto space-y-12 pb-20"
    >
      {/* ─── Header Section ─── */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-6 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
               <Database className="h-3.5 w-3.5 text-primary" />
             </div>
             <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white/20">Operational Ledger</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-none">
            Transaction <span className="gradient-text">History</span>
          </h1>
          <p className="text-white/40 text-sm font-medium max-w-xl">
            A comprehensive immutable record of all financial interactions processed through the 
            Neural Network. Each entry is SHA-256 verified and analyzed for heuristic variance.
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="px-6 py-4 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest font-black text-white/20">Total Records</span>
              <span className="text-2xl font-black text-white tracking-tighter"><AnimatedCounter value={allTx.length} /></span>
           </div>
           <MagneticButton strength={0.2}>
             <button className="h-full px-6 rounded-[24px] bg-white text-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
               <Download className="h-5 w-5" />
               <span className="text-[10px] font-black uppercase tracking-widest">Export</span>
             </button>
           </MagneticButton>
        </div>
      </motion.div>

      {/* ─── Search & Controls ─── */}
      <motion.div variants={itemVariants}>
        <GlowBorder color="#0050FF" className="rounded-[32px]">
          <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ledger by counterparty or metadata..."
                className="w-full h-16 pl-16 bg-white/[0.03] border border-white/5 rounded-[24px] text-white focus:border-primary/40 focus:bg-white/[0.05] transition-all outline-none placeholder:text-white/10 font-medium text-sm"
              />
            </div>
            
            <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-[24px] gap-1 shrink-0">
              {[
                { key: "all", label: "Global" },
                { key: "sent", label: "Outbound" },
                { key: "received", label: "Inbound" },
                { key: "flagged", label: "Anomalies" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-6 py-3 rounded-2xl text-[9px] uppercase tracking-[0.2em] font-black transition-all ${
                    filter === f.key 
                      ? "bg-white text-black shadow-[0_10px_20px_rgba(255,255,255,0.1)]" 
                      : "text-white/20 hover:text-white/40"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </GlowBorder>
      </motion.div>

      {/* ─── Transaction List ─── */}
      <motion.div variants={itemVariants} className="space-y-4">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-[32px] bg-white/[0.02] border border-white/5 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center glass-card-float rounded-[48px] border border-white/5">
             <FilterX className="h-16 w-16 text-white/10 mx-auto mb-6" />
             <h3 className="text-xl font-black text-white uppercase tracking-tighter">No vectors found</h3>
             <p className="text-white/20 text-sm font-medium mt-2">Adjust your filters to scan different sectors of the ledger.</p>
          </div>
        ) : (
          filtered.map((tx, i) => {
            const displayName = tx.counterparty?.full_name || tx.counterparty?.username || "Unknown Node";
            const sc = statusMap[tx.status.toLowerCase()] ?? statusMap.failed;
            const StatusIcon = sc.icon;
            const isExpanded = expanded === tx._id;

            return (
              <motion.div
                key={tx._id}
                layout
                className={`group relative rounded-[32px] border transition-all duration-500 overflow-hidden ${
                  tx.is_fraud 
                    ? "bg-red-500/[0.02] border-red-500/20 shadow-[0_0_40px_rgba(255,59,59,0.05)]" 
                    : isExpanded 
                    ? "bg-white/[0.04] border-white/15" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                {/* Visual Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-20" style={{ background: sc.color }} />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between p-7 lg:p-8 gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`h-16 w-16 rounded-[24px] flex items-center justify-center relative ${
                      tx.transaction_type === "CREDIT" 
                        ? "bg-primary shadow-[0_0_20px_rgba(0,80,255,0.2)]" 
                        : "bg-white/[0.03] group-hover:bg-white/[0.08]"
                    }`}>
                      {tx.transaction_type === "CREDIT" ? (
                        <ArrowDownLeft className="h-7 w-7 text-white" />
                      ) : (
                        <ArrowUpRight className="h-7 w-7 text-white/20 group-hover:text-white" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-[14px] font-black text-white uppercase tracking-wider">{displayName}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                         <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Protocol {tx.transaction_type}</span>
                         <div className="h-1 w-1 rounded-full bg-white/10" />
                         <span className="text-[10px] font-bold text-white/20">{new Date(tx.timestamp).toLocaleString("en-IN", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 lg:gap-12">
                     <div className="text-left lg:text-right min-w-[120px]">
                        <p className={`text-2xl font-black tracking-tighter ${
                          tx.transaction_type === "CREDIT" ? "text-[#00FF94]" : "text-white"
                        }`}>
                          {tx.transaction_type === "CREDIT" ? "+" : "-"}₹{tx.transaction_amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Transaction Value</p>
                     </div>

                     <div className="flex items-center gap-4">
                        <div 
                          className="px-5 py-2.5 rounded-2xl flex items-center gap-3 border"
                          style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
                        >
                           <StatusIcon className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">{sc.label}</span>
                        </div>
                        
                        <MagneticButton strength={0.2}>
                          <button 
                            onClick={() => setExpanded(isExpanded ? null : tx._id)}
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all ${
                              isExpanded ? "bg-white border-white text-black" : "bg-white/[0.03] border-white/5 text-white/20 hover:text-white"
                            }`}
                          >
                             <ChevronDown className={`h-5 w-5 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </MagneticButton>
                     </div>
                  </div>
                </div>

                <AnimatePresence>
                   {isExpanded && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                       className="border-t border-white/5 bg-white/[0.01]"
                     >
                        <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                           {[
                             { label: "Vector ID", val: tx._id.slice(-12).toUpperCase(), icon: Fingerprint },
                             { label: "AI Verification", val: tx.is_fraud ? "FLAGGED: BLOCK" : "VERIFIED: PASS", icon: Shield, color: tx.is_fraud ? "#FF3B3B" : "#00FF94" },
                             { label: "Network Protocol", val: "L7 Encrypted", icon: Lock },
                             { label: "Description", val: tx.description || "N/A", icon: Activity }
                           ].map((item, i) => (
                             <div key={i} className="space-y-2">
                                <div className="flex items-center gap-2">
                                   <item.icon className="h-3 w-3 text-white/20" />
                                   <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">{item.label}</span>
                                </div>
                                <p className="text-xs font-bold text-white truncate" style={{ color: (item as {color?: string}).color }}>{item.val}</p>
                             </div>
                           ))}
                        </div>
                        
                        <div className="px-8 pb-8 flex justify-end gap-4">
                           <button className="px-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                              View Neural Breakdown
                           </button>
                           <button className="px-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                              Download Receipt
                           </button>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
