import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp, TrendingDown, Users, AlertTriangle, DollarSign, Download, Loader2, ArrowUpDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface AdminStats {
  totalTransactions: number;
  fraudCount: number;
  totalVolume: number;
  activeUsers: number;
  barData: { day: string; normal: number; fraud: number }[];
}

interface AdminTx {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  date: string;
  status: "success" | "fraud" | "failed";
  is_fraud: boolean;
}

const chartTooltip = { background: "hsl(232, 25%, 14%)", border: "1px solid hsl(232, 20%, 22%)", borderRadius: "8px", color: "#f1f5f9" };

const fraudTypeColors = [
  "hsl(0, 84%, 60%)", "hsl(38, 92%, 50%)", "hsl(239, 84%, 67%)",
  "hsl(258, 90%, 66%)", "hsl(160, 84%, 39%)",
];

export default function AdminDashboard() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [txFilter, setTxFilter] = useState("all");

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<AdminStats>("/admin/stats", token),
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery<AdminTx[]>({
    queryKey: ["admin-transactions", txFilter],
    queryFn: () =>
      api.get<AdminTx[]>(
        `/admin/transactions?limit=50${txFilter !== "all" ? `&status=${txFilter}` : ""}`,
        token
      ),
  });

  const formatVolume = (v: number) => {
    if (v >= 1e7) return `₹${(v / 1e7).toFixed(1)}Cr`;
    if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
    if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
    return `₹${v}`;
  };

  const fraudRate = stats ? ((stats.fraudCount / Math.max(stats.totalTransactions, 1)) * 100).toFixed(1) : "0";

  const toggleFraudMutation = useMutation({
    mutationFn: ({ id, is_fraud }: { id: string; is_fraud: boolean }) =>
      api.patch<{ message: string }>(
        `/admin/transactions/${id}/fraud`,
        { is_fraud },
        token
      ),
    onSuccess: (data: any) => {
      toast({ title: data.message || "Status updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    },
  });

  const fraudPieData = [
    { name: "Normal", value: (stats?.totalTransactions || 0) - (stats?.fraudCount || 0), color: "hsl(239, 84%, 67%)" },
    { name: "Fraud", value: stats?.fraudCount || 0, color: "hsl(0, 84%, 60%)" },
  ];

  if (statsLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Analytics</h1>
        </div>

        {/* Stat Cards */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Transactions", value: stats?.totalTransactions?.toLocaleString() || "0", icon: DollarSign, trend: `${fraudRate}% fraud`, up: false, color: "text-primary", bg: "bg-primary/10" },
            { label: "Fraud Detected", value: String(stats?.fraudCount || 0), icon: AlertTriangle, trend: `${fraudRate}%`, up: true, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Total Volume", value: formatVolume(stats?.totalVolume || 0), icon: TrendingUp, trend: "", up: true, color: "text-success", bg: "bg-success/10" },
            { label: "Active Users", value: String(stats?.activeUsers || 0), icon: Users, trend: "", up: true, color: "text-secondary", bg: "bg-secondary/10" },
          ].map((c) => (
            <StaggerItem key={c.label}>
              <GlassCard>
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <c.icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                  {c.trend && (
                    <span className={`text-xs flex items-center gap-0.5 ${c.up ? "text-destructive" : "text-muted-foreground"}`}>
                      {c.trend}
                    </span>
                  )}
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
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Fraud vs Normal (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.barData || []}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(215,16%,47%)", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip contentStyle={chartTooltip} />
                <Bar dataKey="normal" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraud" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Fraud vs Normal Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={fraudPieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                  {fraudPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {fraudPieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Transactions Table */}
        <GlassCard hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-semibold">All Transactions</h3>
            <div className="flex gap-2">
              {["all", "fraud", "success", "failed"].map((f) => (
                <button key={f} onClick={() => setTxFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${txFilter === f ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-background/50"}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {txLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    {["Sender", "Receiver", "Amount", "Date", "Status", "Action"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className={`border-b border-border/10 hover:bg-background/30 transition-colors ${tx.status === "fraud" ? "bg-destructive/5" : ""}`}>
                      <td className="py-3 px-3">{tx.sender}</td>
                      <td className="py-3 px-3">{tx.receiver}</td>
                      <td className="py-3 px-3 font-medium">₹{tx.amount?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="py-3 px-3"><StatusBadge status={tx.status} /></td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleFraudMutation.mutate({ id: tx.id, is_fraud: !tx.is_fraud })}
                          disabled={toggleFraudMutation.isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            tx.is_fraud
                              ? "bg-success/10 text-success hover:bg-success/20 border border-success/20"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                          }`}
                          title={tx.is_fraud ? "Mark as Normal" : "Mark as Fraud"}
                        >
                          <ArrowUpDown className="h-3 w-3" />
                          {tx.is_fraud ? "Unmark Fraud" : "Mark Fraud"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
