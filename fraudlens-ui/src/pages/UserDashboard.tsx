import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Send, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Shield, AlertTriangle,
} from "lucide-react";
import { TiltCard, GlowBorder, AnimatedCounter } from "@/components/ui/premium-interactions";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

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

const MetricCard = ({ label, value, sub, icon: Icon, color, delay = 0, suffix = "" }: { label: string; value: string | number; sub: string; icon: React.ElementType; color: string; delay?: number; suffix?: string }) => (
  <motion.div variants={itemVariants}>
    <TiltCard intensity={10} className="h-full">
      <GlowBorder color={color} className="h-full">
        <div className="p-7 relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-6">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-white/[0.03] border border-white/5`}>
              <Icon className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" style={{ color: color }} />
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20">{label}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter text-white">
                <AnimatedCounter value={parseInt(value.toString().replace(/[^0-9]/g, ""))} />
              </span>
              <span className="text-lg font-bold text-white/40">{suffix || (value.toString().includes("%") ? "%" : "")}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2" style={{ color }}>{sub}</p>
          </div>
          
          <div className="absolute bottom-0 left-7 right-7 h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        </div>
      </GlowBorder>
    </TiltCard>
  </motion.div>
);

export default function UserDashboard() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  const { data: transactions = [], isLoading } = useQuery<TxRecord[]>({
    queryKey: ["transactions"],
    queryFn: () => api.get<TxRecord[]>("/transactions/my", token),
    enabled: !!token,
  });

  useEffect(() => { if (transactions.length >= 0) refreshUser(); }, [transactions.length]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.transaction_type === "CREDIT").reduce((s, t) => s + t.transaction_amount, 0);
    const spending = transactions.filter(t => t.transaction_type === "DEBIT").reduce((s, t) => s + t.transaction_amount, 0);
    const flagged = transactions.filter(t => t.is_fraud).length;
    const accuracy = flagged > 0 ? 99.8 : 100;
    return { income, spending, flagged, accuracy };
  }, [transactions]);

  const chartData = useMemo(() => {
    return [
      { t: "00:00", v: 120 }, { t: "04:00", v: 450 }, { t: "08:00", v: 320 }, 
      { t: "12:00", v: 900 }, { t: "16:00", v: 240 }, { t: "20:00", v: 670 }, { t: "23:59", v: 150 }
    ];
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10 max-w-6xl mx-auto"
    >
      {/* ─── Portfolio Section ─── */}
      <motion.div variants={itemVariants}>
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-sm font-bold text-white/40 uppercase">Total Balance</h1>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-white">
                  {showBalance ? (
                    <span>₹{(user?.balance ?? 0).toLocaleString()}</span>
                  ) : (
                    <span className="text-white/10">••••••••</span>
                  )}
                </h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  {showBalance ? <EyeOff className="h-4 w-4 text-white/40" /> : <Eye className="h-4 w-4 text-white/40" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard/send")}
              className="px-4 py-2 bg-white text-black rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-white/90 transition-colors"
            >
              Send Money
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── Summary Cards ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Income" value={stats.income.toLocaleString()} sub="This month" icon={TrendingUp} color="#00D278" suffix="₹" />
        <MetricCard label="Spending" value={stats.spending.toLocaleString()} sub="This month" icon={TrendingDown} color="#FF6B6B" suffix="₹" />
        <MetricCard label="Flagged" value={stats.flagged} sub="Transactions" icon={AlertTriangle} color="#FFB020" />
        <MetricCard label="Fraud Score" value={stats.accuracy} sub="System accuracy" icon={Shield} color="#0050FF" suffix="%" />
      </motion.div>

      {/* ─── Activity Chart ─── */}
      <motion.div variants={itemVariants} className="bg-white/[0.03] border border-white/10 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-white/60 uppercase">Activity Overview</h3>
          <select className="bg-transparent text-white/40 text-xs border border-white/10 rounded-lg px-3 py-1.5 focus:border-white/20 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0050FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0050FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                itemStyle={{ color: '#0050FF' }}
              />
              <Area type="monotone" dataKey="v" stroke="#0050FF" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ─── Recent Transactions ─── */}
      <motion.div variants={itemVariants}>
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white/60 uppercase">Recent Transactions</h3>
            <button
              onClick={() => navigate("/dashboard/history")}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-lg animate-pulse" />
              ))
            ) : (
              transactions.slice(0, 5).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      tx.transaction_type === "CREDIT" ? "bg-primary/20" : "bg-white/[0.05]"
                    }`}>
                      {tx.transaction_type === "CREDIT" ? (
                        <ArrowDownLeft className="h-5 w-5 text-primary" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-white/40" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{tx.counterparty?.username || "User"}</p>
                      <p className="text-xs text-white/40">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${
                    tx.transaction_type === "CREDIT" ? "text-green-400" : "text-white"
                  }`}>
                    {tx.transaction_type === "CREDIT" ? "+" : "-"}₹{tx.transaction_amount.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
