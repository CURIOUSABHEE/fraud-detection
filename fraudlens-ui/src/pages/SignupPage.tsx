import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowRight, ArrowLeft, Check, User, Lock, FileText } from "lucide-react";

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({ name: "", gender: "male", pan: "", username: "", mpin: "", confirmMpin: "" });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const next = () => { setDir(1); setStep((s) => Math.min(2, s + 1)); };
  const back = () => { setDir(-1); setStep((s) => Math.max(0, s - 1)); };

  const stepIcons = [User, Lock, Check];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Animated BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/8 rounded-full blur-3xl" />
      </div>

      {/* Left illustration (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 p-12">
        <div className="text-center max-w-md">
          <Shield className="h-20 w-20 text-primary mx-auto mb-8" />
          <h2 className="text-3xl font-bold mb-4">Join <span className="gradient-text">FraudLens</span></h2>
          <p className="text-muted-foreground">Start protecting your transactions with AI-powered fraud detection today.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold gradient-text">FraudLens</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {["Personal", "Security", "Confirm"].map((label, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${i <= step ? "gradient-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
                    {i < step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`text-xs hidden sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  {i < 2 && <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>

          <div className="glass-card rounded-2xl p-8 gradient-border">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {step === 0 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-semibold mb-1">Personal Information</h3>
                    <p className="text-sm text-muted-foreground mb-4">Tell us about yourself</p>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Enter your full name" className="bg-background/50 border-border/50 focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <div className="flex gap-3">
                        {["male", "female", "other"].map((g) => (
                          <button key={g} onClick={() => update("gender", g)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${form.gender === g ? "gradient-primary text-primary-foreground" : "bg-background/50 border border-border/50 text-muted-foreground hover:border-primary/50"}`}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pan">PAN Card</Label>
                      <Input id="pan" value={form.pan} onChange={(e) => update("pan", e.target.value.toUpperCase())} placeholder="AAAAA0000A" maxLength={10} className="bg-background/50 border-border/50 focus:border-primary uppercase tracking-wider" />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-semibold mb-1">Account Security</h3>
                    <p className="text-sm text-muted-foreground mb-4">Set up your credentials</p>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username / Email</Label>
                      <Input id="username" value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="your@email.com" className="bg-background/50 border-border/50 focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mpin">Create MPIN (6 digits)</Label>
                      <Input id="mpin" type="password" value={form.mpin} onChange={(e) => update("mpin", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" maxLength={6} className="bg-background/50 border-border/50 focus:border-primary text-center tracking-[0.5em] text-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmMpin">Confirm MPIN</Label>
                      <Input id="confirmMpin" type="password" value={form.confirmMpin} onChange={(e) => update("confirmMpin", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" maxLength={6} className="bg-background/50 border-border/50 focus:border-primary text-center tracking-[0.5em] text-xl" />
                    </div>
                    {form.mpin.length === 6 && (
                      <div className="h-1.5 rounded-full bg-background overflow-hidden">
                        <div className="h-full rounded-full gradient-primary transition-all" style={{ width: form.mpin === form.confirmMpin && form.confirmMpin.length === 6 ? "100%" : "50%" }} />
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-semibold mb-1">Review & Confirm</h3>
                    <p className="text-sm text-muted-foreground mb-4">Verify your details</p>
                    <div className="space-y-3 p-4 rounded-lg bg-background/30 border border-border/30">
                      {[
                        ["Full Name", form.name || "—"],
                        ["Gender", form.gender.charAt(0).toUpperCase() + form.gender.slice(1)],
                        ["PAN Card", form.pan || "—"],
                        ["Username", form.username || "—"],
                        ["MPIN", "••••••"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" />
                      <span className="text-muted-foreground">I agree to the Terms of Service</span>
                    </label>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <Button variant="outline" onClick={back} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              {step < 2 ? (
                <Button variant="gradient" onClick={next} className="flex-1">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="gradient" className="flex-1" asChild>
                  <Link to="/dashboard">
                    Create Account <Check className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
