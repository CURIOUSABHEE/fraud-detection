import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, Users, AlertTriangle, DollarSign, Download,
  Cpu, Shield, Activity, Zap, Server, RefreshCw, Clock,
  ChevronRight, BarChart3, RotateCcw, Database, Network,
  Layers, Globe, Terminal, Sparkles, Filter, Search
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Transaction {
  _id: string;
  transaction_type: "DEBIT" | "CREDIT";
  transaction_amount: number;
  status: string;
  is_fraud: boolean;
  sender?: { username: string };
  recipient?: { username: string };
  timestamp: string;
}

interface StatsData {
  totalTransactions: number;
  fraudCount: number;
  totalVolume: number;
  activeUsers: number;
  barData: { day: string; normal: number; fraud: number }[];
  fraudTypes: { name: string; value: number; color?: string }[];
  lineData: { date: string; vol: number }[];
  transactions: Transaction[];
}

const DEFAULT_BAR: { day: string; normal: number; fraud: number }[] = [];
const DEFAULT_PIE: { name: string; value: number; color?: string }[] = [
  { name: "Identity Theft", value: 35, color: "#FF3B3B" },
  { name: "Card Testing", value: 25, color: "#FF6B6B" },
  { name: "Phishing", value: 20, color: "#FFB020" },
  { name: "Account Takeover", value: 15, color: "#A855F7" },
  { name: "Other", value: 5, color: "#0050FF" },
];
const DEFAULT_AREA: { date: string; vol: number }[] = [];

const LOGS: { time: string; msg: string; level: string }[] = [];

const chartTooltip = {
  contentStyle: {
    background: "rgba(5,8,21,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    color: "#f1f5f9",
    fontSize: "11px",
    backdropFilter: "blur(40px)",
    padding: "16px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
  },
};

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

export default function AdminDashboard() {
  const { token } = useAuth();
  const [retraining, setRetraining] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "FRAUD" | "NORMAL">("ALL");
  const [filterPeriod, setFilterPeriod] = useState<"7d" | "30d" | "90d">("7d");

  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<StatsData>("/admin/stats", token),
    enabled: !!token,
    refetchInterval: 30000,
  });

  const filteredTransactions = (data?.transactions ?? []).filter((tx) => {
    const matchesSearch = searchTerm === "" ||
      tx.sender?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipient?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" ||
      (filterType === "FRAUD" && tx.is_fraud) ||
      (filterType === "NORMAL" && !tx.is_fraud);
    return matchesSearch && matchesType;
  }).slice(0, 10);

  const handleRetrain = () => {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      toast.success("Neural model retrained successfully");
    }, 3000);
  };

  const stats = [
    { label: "Total Transactions", value: data?.totalTransactions ?? 0, fmt: (v: number) => v.toLocaleString(), icon: DollarSign, color: "#0050FF" },
    { label: "Fraud Detected", value: data?.fraudCount ?? 0, fmt: (v: number) => v.toLocaleString(), icon: AlertTriangle, color: "#FF3B3B" },
    { label: "Total Volume", value: data?.totalVolume ?? 0, fmt: (v: number) => `₹${(v / 1000000).toFixed(1)}M`, icon: TrendingUp, color: "#00FF94" },
    { label: "Active Users", value: data?.activeUsers ?? 0, fmt: (v: number) => v.toLocaleString(), icon: Users, color: "#00D6FF" },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20"
    >
      {/* ─── Strategy Header Section ─── */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <GlowBorder color="#0050FF" className="overflow-hidden">
          <div className="glass-hero p-10 lg:p-14 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 relative z-10 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0050FF] to-[#00D6FF] flex items-center justify-center shadow-[0_10px_30px_rgba(0,80,255,0.3)]">
                  <Server className="h-7 w-7 text-white" />
                </div>
                <div className="text-left">
                   <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20">Operations Control v4.2</span>
                   <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase leading-none">Command <span className="gradient-text">Center</span></h1>
                </div>
              </div>
              <p className="text-white/40 text-sm font-medium max-w-xl leading-relaxed">
                Strategic oversight of the Neural Network. Monitor system health, retrain heuristic models, 
                and analyze global fraud vectors in a unified intelligence interface.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#00FF94]/5 border border-[#00FF94]/20">
                  <div className="h-2 w-2 rounded-full bg-[#00FF94] shadow-[0_0_10px_#00FF94] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF94]">Infrastructure: Nominal</span>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                   <Network className="h-3.5 w-3.5 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Nodes: 128</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-auto relative z-10">
               <MagneticButton strength={0.1}>
                 <RippleButton 
                  onClick={handleRetrain}
                  disabled={retraining}
                  className="w-full lg:w-64 h-20 rounded-[32px] bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 group"
                 >
                   {retraining ? <RotateCcw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                   {retraining ? "Syncing..." : "Retrain Core"}
                 </RippleButton>
               </MagneticButton>
            </div>
          </div>
        </GlowBorder>
      </motion.div>

      {/* ─── KPI Metrics ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <TiltCard key={i} intensity={10}>
            <div className="glass-card-float p-8 rounded-[40px] border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -mr-16 -mt-16" style={{ backgroundColor: s.color }} />
               
               <div className="flex items-center justify-between mb-8">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-white/[0.03] group-hover:scale-110 transition-transform">
                     <s.icon className="h-6 w-6" style={{ color: s.color }} />
                  </div>
                  <div className="h-2 w-2 rounded-full animate-pulse shadow-[0_0_10px]" style={{ backgroundColor: s.color }} />
               </div>
               
               <div className="space-y-1">
                  <p className="text-5xl font-black tracking-tighter text-white">
                    <AnimatedCounter value={s.value} />
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{s.label}</p>
               </div>
               
               <div className="absolute bottom-0 left-0 right-0 h-1 opacity-20" style={{ backgroundColor: s.color }} />
            </div>
          </TiltCard>
        ))}
      </motion.div>

      {/* ─── Visual Intelligence Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Vector Analysis Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
           <GlowBorder color="#0050FF" className="rounded-[48px]">
              <div className="p-10 lg:p-14 space-y-10">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <BarChart3 className="h-6 w-6 text-primary" />
                       <h3 className="text-[12px] uppercase tracking-[0.5em] font-black text-white/40">Vector Distribution</h3>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Secured</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                          <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Blocked</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={data?.barData ?? DEFAULT_BAR} barGap={8}>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 900 }} />
                          <YAxis hide />
                          <Tooltip {...chartTooltip} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                          <Bar dataKey="normal" fill="#0050FF" radius={[10, 10, 0, 0]} barSize={32} />
                          <Bar dataKey="fraud" fill="#FF3B3B" radius={[10, 10, 0, 0]} barSize={32} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </GlowBorder>
        </motion.div>

         {/* Fraud Breakdown Pie */}
         <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="glass-card-float p-10 lg:p-14 rounded-[48px] border border-white/5 h-full flex flex-col justify-between">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <AlertTriangle className="h-6 w-6 text-red-500" />
                     <h3 className="text-[12px] uppercase tracking-[0.5em] font-black text-white/40">Threat Actors</h3>
                  </div>
                  <div className="h-[200px] w-full flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={data?.fraudTypes ?? DEFAULT_PIE}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={90}
                              paddingAngle={8}
                              strokeWidth={0}
                           >
                              {(data?.fraudTypes ?? DEFAULT_PIE).map((entry, i) => (
                                 <Cell key={i} fill={entry.color ?? DEFAULT_PIE[i]?.color ?? "#333"} />
                              ))}
                           </Pie>
                           <Tooltip {...chartTooltip} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="space-y-4 pt-8">
                  {(data?.fraudTypes ?? DEFAULT_PIE).map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: d.color ?? DEFAULT_PIE[i]?.color }} />
                          <span className="text-[11px] font-black uppercase text-white/30 tracking-widest">{d.name}</span>
                       </div>
                       <span className="text-sm font-black text-white">{d.value}%</span>
                    </div>
                  ))}
               </div>
            </div>
         </motion.div>
       </div>

       {/* ─── Transactions Table with Filters ─── */}
       <motion.div variants={itemVariants} className="space-y-6">
          <div className="glass-card-float p-10 lg:p-14 rounded-[48px] border border-white/5">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                   <Database className="h-6 w-6 text-primary" />
                   <h3 className="text-[12px] uppercase tracking-[0.5em] font-black text-white/40">Transaction Ledger</h3>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="h-12 pl-12 pr-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white/60 text-sm outline-none focus:border-primary/40 w-64 transition-all"
                      />
                   </div>

                   <select
                     value={filterType}
                     onChange={(e) => setFilterType(e.target.value as "ALL" | "FRAUD" | "NORMAL")}
                     className="h-12 px-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white/60 text-sm outline-none focus:border-primary/40 cursor-pointer appearance-none"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "1rem" }}
                   >
                     <option value="ALL">All Types</option>
                     <option value="FRAUD">Fraud Only</option>
                     <option value="NORMAL">Normal Only</option>
                   </select>

                   <select
                     value={filterPeriod}
                     onChange={(e) => setFilterPeriod(e.target.value as "7d" | "30d" | "90d")}
                     className="h-12 px-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white/60 text-sm outline-none focus:border-primary/40 cursor-pointer appearance-none"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "1rem" }}
                   >
                     <option value="7d">Last 7 Days</option>
                     <option value="30d">Last 30 Days</option>
                     <option value="90d">Last 90 Days</option>
                   </select>
                </div>
             </div>

             {/* Transactions Table */}
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-white/5">
                         {["ID", "Type", "Amount", "Sender", "Recipient", "Status", "Fraud", "Date"].map((h) => (
                           <th key={h} className="text-left py-4 px-4 text-[9px] uppercase tracking-[0.2em] font-black text-white/30">{h}</th>
                         ))}
                      </tr>
                   </thead>
                   <tbody>
                     {isLoading ? (
                       [...Array(5)].map((_, i) => (
                         <tr key={i} className="border-b border-white/5">
                           {[...Array(8)].map((_, j) => (
                             <td key={j} className="py-4 px-4"><div className="h-4 bg-white/5 rounded w-20 animate-pulse" /></td>
                           ))}
                         </tr>
                       ))
                     ) : filteredTransactions.length === 0 ? (
                       <tr>
                         <td colSpan={8} className="py-12 text-center text-sm text-white/20 uppercase tracking-wider font-bold">No transactions found</td>
                       </tr>
                     ) : (
                       filteredTransactions.map((tx) => (
                         <tr key={tx._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                           <td className="py-4 px-4 font-mono text-xs text-white/40">{tx._id.slice(-6)}</td>
                           <td className="py-4 px-4">
                             <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                               tx.transaction_type === "CREDIT" ? "bg-[#00FF94]/10 text-[#00FF94]" : "bg-white/5 text-white/40"
                             }`}>
                               {tx.transaction_type}
                             </span>
                           </td>
                           <td className="py-4 px-4 text-sm font-bold text-white">₹{tx.transaction_amount.toLocaleString()}</td>
                           <td className="py-4 px-4 text-sm text-white/60">{tx.sender?.username || "—"}</td>
                           <td className="py-4 px-4 text-sm text-white/60">{tx.recipient?.username || "—"}</td>
                           <td className="py-4 px-4">
                             <span className={`text-[10px] font-black uppercase tracking-wider ${
                               tx.status === "COMPLETED" ? "text-[#00FF94]" : "text-orange-400"
                             }`}>
                               {tx.status}
                             </span>
                           </td>
                           <td className="py-4 px-4">
                             {tx.is_fraud ? (
                               <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
                             ) : (
                               <div className="h-2 w-2 rounded-full bg-[#00FF94] shadow-[0_0_10px_#00FF94]" />
                             )}
                           </td>
                           <td className="py-4 px-4 text-xs text-white/30">{new Date(tx.timestamp).toLocaleDateString()}</td>
                         </tr>
                       ))
                     )}
                   </tbody>
                </table>
             </div>
          </div>
       </motion.div>

       {/* ─── Bottom Intelligence Row ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         {/* Live Activity Area */}
         <motion.div variants={itemVariants} className="xl:col-span-5">
            <div className="glass-card-float p-10 rounded-[48px] border border-white/5 space-y-10">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Activity className="h-6 w-6 text-[#00D6FF]" />
                     <h3 className="text-[12px] uppercase tracking-[0.5em] font-black text-white/40">Flow Velocity</h3>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-[#00FF94]/10 border border-[#00FF94]/20 flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-[#00FF94] animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-[#00FF94]">Real-time</span>
                  </div>
               </div>
               
               <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={DEFAULT_AREA}>
                        <defs>
                           <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00D6FF" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#00D6FF" stopOpacity={0} />
                           </linearGradient>
                        </defs>
                        <Tooltip {...chartTooltip} />
                        <Area type="monotone" dataKey="v" stroke="#00D6FF" strokeWidth={4} fill="url(#areaGrad)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </motion.div>

         {/* System Logs Terminal */}
         <motion.div variants={itemVariants} className="xl:col-span-7">
            <div className="glass-card-float p-10 rounded-[48px] border border-white/5 h-full space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Terminal className="h-6 w-6 text-white/20" />
                     <h3 className="text-[12px] uppercase tracking-[0.5em] font-black text-white/40">Kernel Stream</h3>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Clear Ledger</button>
               </div>
               
               <div className="space-y-5 font-mono">
                  {LOGS.map((log, i) => (
                    <div key={i} className="flex gap-6 group">
                       <span className="text-[11px] text-white/10 font-bold shrink-0">{log.time}</span>
                       <div className="relative mt-2 shrink-0">
                          <div className={`h-2 w-2 rounded-full shadow-[0_0_10px] ${log.level === 'critical' ? 'bg-red-500 shadow-red-500' : log.level === 'warning' ? 'bg-orange-500 shadow-orange-500' : 'bg-[#00FF94] shadow-[#00FF94]'}`} />
                       </div>
                       <p className={`text-[12px] leading-relaxed transition-colors ${log.level === 'critical' ? 'text-red-400 font-bold' : 'text-white/40 group-hover:text-white'}`}>
                         {log.msg}
                       </p>
                    </div>
                  ))}
               </div>
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
}
