import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Clock, Calendar, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, token, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName]   = useState(user?.full_name || "");
  const [panCard, setPanCard]     = useState(user?.pan_card || "");
  const [gender, setGender]       = useState(user?.gender || "");
  const [saving, setSaving]       = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = (user?.full_name || user?.username || "?")[0].toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";
  const lastLogin = user?.latest_login
    ? new Date(user.latest_login).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/users/me", { full_name: fullName, pan_card: panCard, gender }, token);
      await refreshUser();
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Profile Header */}
        <GlassCard className="flex flex-col sm:flex-row items-center gap-6" hover={false}>
          <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
            {initial}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">{user?.full_name || user?.username || "—"}</h2>
            <p className="text-muted-foreground">@{user?.username}</p>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 justify-center sm:justify-start">
              <Calendar className="h-3.5 w-3.5" /> Member since {memberSince}
            </p>
          </div>
          <div className="sm:ml-auto flex flex-col items-center sm:items-end gap-3">
            <div className="text-center sm:text-right">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold gradient-text">₹{(user?.balance ?? 0).toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
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
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>PAN Card</Label>
                  <Input
                    value={panCard}
                    onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                    placeholder="AAAAA0000A"
                    maxLength={10}
                    className="bg-background/50 border-border/50 uppercase tracking-wider"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <div className="flex gap-3">
                    {["male", "female", "other"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${gender === g ? "gradient-primary text-primary-foreground" : "bg-background/50 border border-border/50 text-muted-foreground hover:border-primary/50"}`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input value={user?.username || ""} readOnly className="bg-background/30 border-border/30 opacity-60" />
                </div>
                <Button variant="gradient" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
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
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                  <div>
                    <p className="text-sm font-medium">Two-Factor Auth</p>
                    <p className="text-xs text-muted-foreground">TOTP-based extra security</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-muted/30 relative cursor-pointer">
                    <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-muted transition-all" />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/30 space-y-1">
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="text-sm font-medium">{lastLogin}</p>
                </div>
              </div>
            </GlassCard>
          </StaggerItem>

          {/* Account Activity */}
          <StaggerItem>
            <GlassCard hover={false}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Account Info
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Username",      value: user?.username || "—" },
                  { label: "Balance",       value: `₹${(user?.balance ?? 0).toLocaleString()}` },
                  { label: "Member Since",  value: memberSince },
                  { label: "Last Login",    value: lastLogin },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
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
