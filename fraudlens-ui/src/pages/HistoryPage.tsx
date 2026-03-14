import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageTransition } from "@/components/layout/PageTransition";
import { ArrowUpRight, ArrowDownLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

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

export default function HistoryPage() {
  const { token } = useAuth();
  const [filter, setFilter] = useState("all");
  const [search, setSearch]   = useState("");

  const { data: allTx = [], isLoading } = useQuery<TxRecord[]>({
    queryKey: ["transactions"],
    queryFn: () => api.get<TxRecord[]>("/transactions/my", token),
    enabled: !!token,
  });

  const filtered = allTx.filter((t) => {
    const name = t.counterparty?.full_name || t.counterparty?.username || "";
    const matchFilter =
      filter === "all" ||
      (filter === "sent"     && t.transaction_type === "DEBIT") ||
      (filter === "received" && t.transaction_type === "CREDIT") ||
      (filter === "flagged"  && t.is_fraud);
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>

        <GlassCard hover={false}>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description…"
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>
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
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-background/30 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No transactions found</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((tx) => {
                const displayName = tx.counterparty?.full_name || tx.counterparty?.username || "—";
                return (
                  <motion.div
                    key={tx._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.transaction_type === "CREDIT" ? "bg-success/10" : "bg-primary/10"}`}>
                        {tx.transaction_type === "CREDIT"
                          ? <ArrowDownLeft className="h-4 w-4 text-success" />
                          : <ArrowUpRight className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {tx.description && ` · ${tx.description}`}
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
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </PageTransition>
  );
}
