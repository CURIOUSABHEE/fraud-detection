import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageTransition } from "@/components/layout/PageTransition";
import { ArrowUpRight, ArrowDownLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const allTx = [
  { id: 1, type: "sent", name: "Priya Sharma", amount: 5000, date: "Mar 12, 2:30 PM", status: "success" as const },
  { id: 2, type: "received", name: "Rahul Verma", amount: 12500, date: "Mar 12, 11:15 AM", status: "success" as const },
  { id: 3, type: "sent", name: "Unknown User", amount: 50000, date: "Mar 11, 8:45 PM", status: "fraud" as const },
  { id: 4, type: "sent", name: "Amit Kumar", amount: 2000, date: "Mar 11, 3:20 PM", status: "pending" as const },
  { id: 5, type: "received", name: "Neha Singh", amount: 8000, date: "Mar 10, 9:00 AM", status: "success" as const },
  { id: 6, type: "sent", name: "Vikram Patel", amount: 15000, date: "Mar 9, 4:00 PM", status: "success" as const },
  { id: 7, type: "received", name: "Sanjay Gupta", amount: 3200, date: "Mar 8, 1:30 PM", status: "success" as const },
  { id: 8, type: "sent", name: "Suspicious Acct", amount: 75000, date: "Mar 7, 11:00 PM", status: "fraud" as const },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = allTx.filter((t) => {
    const matchFilter = filter === "all" || (filter === "sent" && t.type === "sent") || (filter === "received" && t.type === "received") || (filter === "flagged" && t.status === "fraud");
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
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
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." className="pl-10 bg-background/50 border-border/50" />
            </div>
            <div className="flex gap-2">
              {["all", "sent", "received", "flagged"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-background/50"}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filtered.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === "received" ? "bg-success/10" : "bg-primary/10"}`}>
                    {tx.type === "received" ? <ArrowDownLeft className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-primary" />}
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
