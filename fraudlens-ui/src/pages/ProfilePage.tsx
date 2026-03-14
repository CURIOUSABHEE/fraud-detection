import { GlassCard } from "@/components/shared/GlassCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Smartphone, Clock, Calendar } from "lucide-react";

export default function ProfilePage() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Profile Header */}
        <GlassCard className="flex flex-col sm:flex-row items-center gap-6" hover={false}>
          <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
            A
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">Alex Johnson</h2>
            <p className="text-muted-foreground">@alexjohnson</p>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 justify-center sm:justify-start">
              <Calendar className="h-3.5 w-3.5" /> Member since Jan 2025
            </p>
          </div>
          <div className="sm:ml-auto text-center">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold gradient-text">₹1,24,580</p>
          </div>
        </GlassCard>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <StaggerItem>
            <GlassCard hover={false}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Personal Info
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input defaultValue="Alex Johnson" className="bg-background/50 border-border/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>PAN Card</Label>
                  <Input defaultValue="ABCDE1234F" className="bg-background/50 border-border/50 uppercase tracking-wider" />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Input defaultValue="Male" className="bg-background/50 border-border/50" readOnly />
                </div>
                <Button variant="gradient" size="sm">Save Changes</Button>
              </div>
            </GlassCard>
          </StaggerItem>

          {/* Security */}
          <StaggerItem>
            <GlassCard hover={false}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Security
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Change MPIN</Label>
                  <Input type="password" placeholder="New 6-digit MPIN" maxLength={6} className="bg-background/50 border-border/50 tracking-[0.5em] text-center" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                  <div>
                    <p className="text-sm font-medium">Two-Factor Auth</p>
                    <p className="text-xs text-muted-foreground">Extra security layer</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-success/20 relative cursor-pointer">
                    <div className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-success transition-all" />
                  </div>
                </div>
                <Button variant="gradient" size="sm">Update Security</Button>
              </div>
            </GlassCard>
          </StaggerItem>

          {/* Devices */}
          <StaggerItem>
            <GlassCard hover={false}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> Devices
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Chrome on MacOS", last: "Active now", active: true },
                  { name: "Firefox on Windows", last: "2 days ago", active: false },
                ].map((d) => (
                  <div key={d.name} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.last}</p>
                      </div>
                    </div>
                    {d.active && <span className="h-2 w-2 rounded-full bg-success" />}
                  </div>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>

          {/* Activity */}
          <StaggerItem>
            <GlassCard hover={false}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  { action: "Password changed", time: "2 hours ago" },
                  { action: "Login from new device", time: "1 day ago" },
                  { action: "Transaction sent — ₹5,000", time: "2 days ago" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <p className="text-sm">{a.action}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
