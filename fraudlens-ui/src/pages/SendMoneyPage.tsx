import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, MapPin, Globe, AlertCircle, CheckCircle, XCircle, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SendResult {
  message: string;
  transaction: {
    id: string;
    amount: number;
    recipient: string;
    recipient_name?: string;
    status: string;
    is_fraud: boolean;
    new_balance: number;
  };
}

interface UserSuggestion {
  username: string;
  full_name: string | null;
}

export default function SendMoneyPage() {
  const { token, refreshUser } = useAuth();
  const [recipient, setRecipient]       = useState("");
  const [amount, setAmount]             = useState("");
  const [description, setDescription]   = useState("");
  const [mpin, setMpin]                 = useState("");
  const [geoInfo, setGeoInfo]           = useState<{ lat?: number; long?: number; label: string }>({ label: "Detecting…" });
  const [mpinOpen, setMpinOpen]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<SendResult | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions]   = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) { setGeoInfo({ label: "Not available" }); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeoInfo({ lat: pos.coords.latitude, long: pos.coords.longitude, label: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}` }),
      ()    => setGeoInfo({ label: "Denied" })
    );
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
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
    if (!recipient.trim())              { toast.error("Enter recipient username"); return; }
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
        sender_lat:  geoInfo.lat,
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
    <PageTransition>
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Send Money</h1>

        {/* Result banner */}
        {result && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${result.transaction.is_fraud ? "bg-destructive/10 border-destructive/30" : "bg-success/10 border-success/30"}`}>
            {result.transaction.is_fraud
              ? <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              : <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />}
            <div>
              <p className="font-medium text-sm">{result.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ₹{result.transaction.amount.toLocaleString()} → {result.transaction.recipient_name || result.transaction.recipient}
                {" · "}New balance: ₹{result.transaction.new_balance.toLocaleString()}
              </p>
            </div>
            <button onClick={() => setResult(null)} className="ml-auto text-muted-foreground hover:text-foreground text-xs">✕</button>
          </div>
        )}

        <GlassCard hover={false} className="gradient-border">
          <div className="space-y-5">

            {/* Recipient with autocomplete */}
            <div className="space-y-1.5" ref={wrapperRef}>
              <Label>Recipient Username</Label>
              <div className="relative">
                <Input
                  value={recipient}
                  onChange={(e) => handleRecipientChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search username…"
                  className={`bg-background/50 border-border/50 focus:border-primary pr-8 ${selectedUser ? "border-success/50 bg-success/5" : ""}`}
                  autoComplete="off"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                )}
                {selectedUser && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 top-full mt-1 w-full rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden"
                    >
                      {suggestions.map((u, i) => (
                        <button
                          key={u.username}
                          onMouseDown={(e) => { e.preventDefault(); selectSuggestion(u); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-primary/10 transition-colors ${i > 0 ? "border-t border-border/30" : ""}`}
                        >
                          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{u.username}</p>
                            {u.full_name && (
                              <p className="text-xs text-muted-foreground truncate">{u.full_name}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected user chip */}
              {selectedUser && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                  <span className="text-success font-medium">{selectedUser.username}</span>
                  {selectedUser.full_name && (
                    <span className="text-muted-foreground">· {selectedUser.full_name}</span>
                  )}
                  <button
                    onClick={() => { setRecipient(""); setSelectedUser(null); }}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >✕</button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-background/50 border-border/50 focus:border-primary text-2xl font-semibold h-14"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this for?"
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30 text-sm">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">IP</p>
                  <p className="text-xs font-mono">Captured by server</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-xs truncate">{geoInfo.label}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                AI will analyse this transaction in real-time using Neo4j graph anomaly detection before processing.
              </p>
            </div>

            <Button variant="gradient" className="w-full" size="lg" onClick={openConfirmation}>
              <Send className="mr-2 h-4 w-4" /> Send Money
            </Button>
          </div>
        </GlassCard>

        {/* MPIN Confirmation Dialog */}
        <Dialog open={mpinOpen} onOpenChange={setMpinOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirm with MPIN</DialogTitle>
              <DialogDescription>
                Sending ₹{Number(amount).toLocaleString()} to{" "}
                <strong>{selectedUser?.full_name || recipient}</strong>
                {selectedUser?.full_name && <span className="text-muted-foreground"> (@{recipient})</span>}.{" "}
                Enter your 6-digit MPIN to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                type="password"
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                maxLength={6}
                className="text-center tracking-[0.5em] text-xl bg-background/50"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <div className="flex justify-center gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`h-3 w-3 rounded-full transition-all ${i < mpin.length ? "gradient-primary scale-110" : "bg-border"}`} />
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setMpinOpen(false)} disabled={loading}>Cancel</Button>
                <Button variant="gradient" className="flex-1" onClick={handleSend} disabled={loading || mpin.length !== 6}>
                  {loading ? "Processing…" : "Confirm"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
