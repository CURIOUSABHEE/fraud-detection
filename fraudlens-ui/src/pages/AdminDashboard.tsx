import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, TrendingDown, Users, AlertTriangle, DollarSign, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

const barData = [
  { day: "Mon", normal: 120, fraud: 3 }, { day: "Tue", normal: 180, fraud: 5 },
  { day: "Wed", normal: 150, fraud: 2 }, { day: "Thu", normal: 250, fraud: 8 },
  { day: "Fri", normal: 220, fraud: 4 }, { day: "Sat", normal: 300, fraud: 6 },
  { day: "Sun", normal: 280, fraud: 3 },
];

const fraudTypes = [
  { name: "Velocity", value: 35, color: "hsl(0, 84%, 60%)" },
  { name: "Geo Anomaly", value: 25, color: "hsl(38, 92%, 50%)" },
  { name: "Device", value: 20, color: "hsl(239, 84%, 67%)" },
  { name: "Ring", value: 12, color: "hsl(258, 90%, 66%)" },
  { name: "Star", value: 8, color: "hsl(160, 84%, 39%)" },
];

const lineData = [
  { date: "Mar 1", vol: 1200 }, { date: "Mar 3", vol: 1800 }, { date: "Mar 5", vol: 1500 },
  { date: "Mar 7", vol: 2500 }, { date: "Mar 9", vol: 2200 }, { date: "Mar 11", vol: 3000 },
  { date: "Mar 12", vol: 2800 },
];

const adminTx = [
  { id: "TX001", sender: "alex_j", receiver: "priya_s", amount: 5000, date: "Mar 12", status: "success" as const, anomalies: [] },
  { id: "TX002", sender: "unknown_42", receiver: "rahul_v", amount: 50000, date: "Mar 12", status: "fraud" as const, anomalies: ["Velocity", "Geo"] },
  { id: "TX003", sender: "neha_s", receiver: "amit_k", amount: 2000, date: "Mar 11", status: "pending" as const, anomalies: ["Device"] },
  { id: "TX004", sender: "ring_node_1", receiver: "ring_node_5", amount: 99000, date: "Mar 11", status: "fraud" as const, anomalies: ["Ring", "Velocity", "Star"] },
  { id: "TX005", sender: "amit_k", receiver: "neha_s", amount: 8000, date: "Mar 10", status: "success" as const, anomalies: [] },
];

const chartTooltip = { background: "hsl(232, 25%, 14%)", border: "1px solid hsl(232, 20%, 22%)", borderRadius: "8px", color: "#f1f5f9" };

export default function AdminDashboard() {
  const [txFilter, setTxFilter] = useState("all");
  const filteredTx = adminTx.filter((t) => {
    if (txFilter === "fraud") return t.status === "fraud";
    if (txFilter === "pending") return t.status === "pending";
    if (txFilter === "approved") return t.status === "success";
    return true;
  });

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Analytics</h1>
          <Button variant="hero-ghost" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Stat Cards */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Transactions", value: "1,580", icon: DollarSign, trend: "+12%", up: true, color: "text-primary", bg: "bg-primary/10" },
            { label: "Fraud Detected", value: "31", icon: AlertTriangle, trend: "2.0%", up: true, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Total Volume", value: "₹2.4M", icon: TrendingUp, trend: "+18%", up: true, color: "text-success", bg: "bg-success/10" },
            { label: "Active Users", value: "342", icon: Users, trend: "+5", up: true, color: "text-secondary", bg: "bg-secondary/10" },
          ].map((c) => (
            <StaggerItem key={c.label}>
              <GlassCard>
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <c.icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                  <span className={`text-xs flex items-center gap-0.5 ${c.up ? "text-success" : "text-destructive"}`}>
                    {c.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {c.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold mt-3">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Fraud vs Normal</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(215,16%,47%)", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip contentStyle={chartTooltip} />
                <Bar dataKey="normal" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraud" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Fraud Type Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={fraudTypes} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                  {fraudTypes.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {fraudTypes.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} ({d.value}%)
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard hover={false}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Transaction Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(232, 20%, 22%)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(215,16%,47%)", fontSize: 12 }} />
              <YAxis hide />
              <Tooltip contentStyle={chartTooltip} />
              <Line type="monotone" dataKey="vol" stroke="hsl(258, 90%, 66%)" strokeWidth={2} dot={{ fill: "hsl(258, 90%, 66%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Transactions Table */}
        <GlassCard hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-semibold">All Transactions</h3>
            <div className="flex gap-2">
              {["all", "fraud", "pending", "approved"].map((f) => (
                <button key={f} onClick={() => setTxFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${txFilter === f ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-background/50"}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  {["ID", "Sender", "Receiver", "Amount", "Date", "Status", "Anomalies"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className={`border-b border-border/10 hover:bg-background/30 transition-colors ${tx.status === "fraud" ? "bg-destructive/5" : ""}`}>
                    <td className="py-3 px-3 font-mono text-xs">{tx.id}</td>
                    <td className="py-3 px-3">{tx.sender}</td>
                    <td className="py-3 px-3">{tx.receiver}</td>
                    <td className="py-3 px-3 font-medium">₹{tx.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-muted-foreground">{tx.date}</td>
                    <td className="py-3 px-3"><StatusBadge status={tx.status} /></td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {tx.anomalies.map((a) => (
                          <span key={a} className="px-2 py-0.5 rounded text-xs bg-destructive/10 text-destructive border border-destructive/20">{a}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
