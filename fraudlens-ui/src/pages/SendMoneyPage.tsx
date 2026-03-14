import { GlassCard } from "@/components/shared/GlassCard";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MapPin, Smartphone, Globe, AlertCircle } from "lucide-react";

export default function SendMoneyPage() {
  return (
    <PageTransition>
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Send Money</h1>

        <GlassCard hover={false} className="gradient-border">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Recipient Username</label>
              <Input placeholder="Search by username..." className="bg-background/50 border-border/50 focus:border-primary" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Amount (₹)</label>
              <Input type="number" placeholder="0.00" className="bg-background/50 border-border/50 focus:border-primary text-2xl font-semibold h-14" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Description (optional)</label>
              <Input placeholder="What's this for?" className="bg-background/50 border-border/50 focus:border-primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30 text-sm">
                <Smartphone className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Device</p>
                  <p className="text-xs font-mono truncate">Chrome-Mac</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30 text-sm">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">IP</p>
                  <p className="text-xs font-mono">192.168.1.x</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-xs">New Delhi, IN</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                AI will analyze this transaction in real-time before processing. You'll need to confirm with your MPIN.
              </p>
            </div>

            <Button variant="gradient" className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" /> Send Money
            </Button>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
