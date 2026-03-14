import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StaggerContainer, StaggerItem, PageTransition } from "@/components/layout/PageTransition";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Send, ArrowUpRight, ArrowDownLeft,
  TrendingUp, AlertTriangle, DollarSign,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
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

const PIE_COLORS: Record<string, string> = {
  SUCCESS: "hsl(160, 84%, 39%)",
  PENDING: "hsl(38, 92%, 50%)",
  FRAUD:   "hsl(0, 84%, 60%)",
  FAILED:  "hsl(215, 16%, 47%)",
};

export default function UserDashboard() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState("all");

  const { data: transactions = [], isLoading } = useQuery<TxRecord[]>({
    queryKey: ["transactions"],
    queryFn: () => api.get<TxRecord[]>("/transactions/my", token),
    enabled: !!token,
    refetchOnWindowFocus: true,
  });

  // Refresh user balance whenever transactions load
  useMemo(() => { if (transactions.length >= 0) refreshUser(); }, [transactions.length]); // eslint-disable-line

  // ── Derived stats ─────────────────────────────────────────────────────────
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyTxs = transactions.filter((t) => new Date(t.timestamp).getTime() >= weekAgo);

  const income   = weeklyTxs.filter((t) => t.transaction_type === "CREDIT").reduce((s, t) => s + t.transaction_amount, 0);
  const expenses = weeklyTxs.filter((t) => t.transaction_type === "DEBIT").reduce((s, t) => s + t.transaction_amount, 0);
  const flagged  = transactions.filter((t) => t.is_fraud).length;

  // 7-day area chart: daily DEBIT spend
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const areaData = DAYS.map((day, idx) => ({
    day,
    amt: weeklyTxs
      .filter((t) => t.transaction_type === "DEBIT" && new Date(t.timestamp).getDay() === idx)
      .reduce((s, t) => s + t.transaction_amount, 0),
  }));

  // Pie chart: status distribution
  const statusCounts: Record<string, number> = {};
  transactions.forEach((t) => { statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name, value, color: PIE_COLORS[name] ?? "hsl(215,16%,47%)",
  }));

  const filtered = transactions.slice(0, 20).filter((t) => {
    if (filter === "sent")     return t.transaction_type === "DEBIT";
    if (filter === "received") return t.transaction_type === "CREDIT";
    if (filter === "flagged")  return t.is_fraud;
    return true;
  });

  const displayName = (tx: TxRecord) =>
    tx.counterparty?.full_name || tx.counterparty?.username || "—";

  const balance = user?.balance ?? 0;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-6 sm:p-8 gradient-border glow-primary"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-bold">
                  {showBalance ? (
                    <span>₹<AnimatedCounter value={balance} /></span>
                  ) : "₹ ••••••"}
                </h2>
                <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {income > 0 && (
                <p className="text-sm text-success mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> +₹{income.toLocaleString()} received this week
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="gradient" className="flex-1 sm:flex-none" onClick={() => navigate("/dashboard/send")}>
                <Send className="mr-2 h-4 w-4" /> Send Money
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Income (Week)",    value: `₹${income.toLocaleString()}`,        icon: ArrowDownLeft, color: "text-success",     bg: "bg-success/10" },
            { label: "Expenses (Week)",  value: `₹${expenses.toLocaleString()}`,      icon: ArrowUpRight,  color: "text-destructive",  bg: "bg-destructive/10" },
            { label: "Transactions",     value: String(transactions.length),          icon: DollarSign,    color: "text-primary",       bg: "bg-primary/10" },
            { label: "Flagged",          value: String(flagged),                       icon: AlertTriangle, color: "text-warning",       bg: "bg-warning/10" },
          ].map((c) => (
            <StaggerItem key={c.label}>
              <GlassCard className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-lg font-semibold mt-0.5">{c.value}</p>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2" hover={false}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">7-Day Spending Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "hsl(232, 25%, 14%)", border: "1px solid hsl(232, 20%, 22%)", borderRadius: "8px", color: "#f1f5f9" }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Amount"]} />
                <Area type="monotone" dataKey="amt" stroke="hsl(239, 84%, 67%)" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Status Distribution</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(232, 25%, 14%)", border: "1px solid hsl(232, 20%, 22%)", borderRadius: "8px", color: "#f1f5f9" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name.charAt(0) + d.name.slice(1).toLowerCase()}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center mt-8">No transactions yet</p>
            )}
          </GlassCard>
        </div>

        {/* Transaction History */}
        <GlassCard hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-semibold">Recent Transactions</h3>
            <div className="flex gap-2">
              {["all", "sent", "received", "flagged"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-background/50"}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-background/30 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((tx) => (
                <motion.div
                  key={tx._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.transaction_type === "CREDIT" ? "bg-success/10" : "bg-primary/10"}`}>
                      {tx.transaction_type === "CREDIT"
                        ? <ArrowDownLeft className="h-4 w-4 text-success" />
                        : <ArrowUpRight className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{displayName(tx)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${tx.transaction_type === "CREDIT" ? "text-success" : "text-foreground"}`}>
                      {tx.transaction_type === "CREDIT" ? "+" : "-"}₹{tx.transaction_amount.toLocaleString()}
                    </span>
                    <StatusBadge status={tx.status.toLowerCase() as "success" | "pending" | "fraud" | "failed"} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </PageTransition>
  );
}
