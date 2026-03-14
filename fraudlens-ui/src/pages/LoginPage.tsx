import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [mpin, setMpin] = useState("");
  const [showMpin, setShowMpin] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 50, 0] }} transition={{ duration: 13, repeat: Infinity }} className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-secondary/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary mb-4 glow-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your FraudLens account</p>
        </div>

        <div className="glass-card rounded-2xl p-8 gradient-border space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email / Username</Label>
            <Input id="email" placeholder="your@email.com" className="bg-background/50 border-border/50 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mpin">MPIN (6 digits)</Label>
            <div className="relative">
              <Input
                id="mpin"
                type={showMpin ? "text" : "password"}
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                maxLength={6}
                className="bg-background/50 border-border/50 focus:border-primary text-center tracking-[0.5em] text-xl pr-12"
              />
              <button onClick={() => setShowMpin(!showMpin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showMpin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* MPIN dots */}
            <div className="flex justify-center gap-2.5 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`h-3 w-3 rounded-full transition-all duration-200 ${i < mpin.length ? "gradient-primary scale-110" : "bg-border"}`} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="rounded border-border" />
              Remember device
            </label>
            <a href="#" className="text-primary hover:underline">Forgot MPIN?</a>
          </div>

          <Button variant="gradient" className="w-full" size="lg" asChild>
            <Link to="/dashboard">Sign In</Link>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}
