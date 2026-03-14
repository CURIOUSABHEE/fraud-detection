import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StaggerContainer, StaggerItem, PageTransition } from "@/components/layout/PageTransition";
import {
  Eye, EyeOff, Plus, Send, ArrowUpRight, ArrowDownLeft,
  TrendingUp, TrendingDown, AlertTriangle, DollarSign,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const areaData = [
  { day: "Mon", amt: 12000 }, { day: "Tue", amt: 18000 }, { day: "Wed", amt: 15000 },
  { day: "Thu", amt: 25000 }, { day: "Fri", amt: 22000 }, { day: "Sat", amt: 30000 }, { day: "Sun", amt: 28000 },
];

const pieData = [
  { name: "Success", value: 85, color: "hsl(160, 84%, 39%)" },
  { name: "Pending", value: 8, color: "hsl(38, 92%, 50%)" },
  { name: "Fraud", value: 5, color: "hsl(0, 84%, 60%)" },
  { name: "Failed", value: 2, color: "hsl(215, 16%, 47%)" },
];

const transactions = [
  { id: 1, type: "sent", name: "Priya Sharma", amount: 5000, date: "Today, 2:30 PM", status: "success" as const },
  { id: 2, type: "received", name: "Rahul Verma", amount: 12500, date: "Today, 11:15 AM", status: "success" as const },
  { id: 3, type: "sent", name: "Unknown User", amount: 50000, date: "Yesterday, 8:45 PM", status: "fraud" as const },
  { id: 4, type: "sent", name: "Amit Kumar", amount: 2000, date: "Yesterday, 3:20 PM", status: "pending" as const },
  { id: 5, type: "received", name: "Neha Singh", amount: 8000, date: "Mar 10, 9:00 AM", status: "success" as const },
];

export default function UserDashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState("all");

  const filtered = transactions.filter((t) => {
    if (filter === "sent") return t.type === "sent";
    if (filter === "received") return t.type === "received";
    if (filter === "flagged") return t.status === "fraud";
    return true;
  });

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
                    <span>₹<AnimatedCounter value={124580} /></span>
                  ) : (
                    "₹ ••••••"
                  )}
                </h2>
                <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-sm text-success mt-2 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> +12.5% from last month
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="gradient" className="flex-1 sm:flex-none">
                <Plus className="mr-2 h-4 w-4" /> Add Money
              </Button>
              <Button variant="hero-ghost" className="flex-1 sm:flex-none">
                <Send className="mr-2 h-4 w-4" /> Send Money
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Income (Week)", value: "₹32,500", icon: ArrowDownLeft, color: "text-success", bg: "bg-success/10" },
            { label: "Expenses (Week)", value: "₹18,200", icon: ArrowUpRight, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Transactions", value: "47", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
            { label: "Flagged", value: "3", icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
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
            <h3 className="text-sm font-medium text-muted-foreground mb-4">7-Day Activity</h3>
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
                <Tooltip contentStyle={{ background: "hsl(232, 25%, 14%)", border: "1px solid hsl(232, 20%, 22%)", borderRadius: "8px", color: "#f1f5f9" }} />
                <Area type="monotone" dataKey="amt" stroke="hsl(239, 84%, 67%)" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(232, 25%, 14%)", border: "1px solid hsl(232, 20%, 22%)", borderRadius: "8px", color: "#f1f5f9" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Transaction History */}
        <GlassCard hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-semibold">Transaction History</h3>
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

          <div className="space-y-3">
            {filtered.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === "received" ? "bg-success/10" : "bg-primary/10"}`}>
                    {tx.type === "received" ? (
                      <ArrowDownLeft className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold ${tx.type === "received" ? "text-success" : "text-foreground"}`}>
                    {tx.type === "received" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </span>
                  <StatusBadge status={tx.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
