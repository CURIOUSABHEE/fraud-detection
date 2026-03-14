import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { Link } from "react-router-dom";
import {
  Shield, Brain, GitBranch, MapPin, Smartphone, Zap, RefreshCw,
  UserPlus, Wallet, Send, Eye, Star, ArrowRight, ChevronRight,
} from "lucide-react";

const features = [
  { icon: Brain, title: "AI Fraud Detection", desc: "XGBoost ML model analyzes patterns in real-time to identify fraudulent transactions before they complete." },
  { icon: GitBranch, title: "Graph Pattern Analysis", desc: "Detects ring, star, and velocity fraud patterns through advanced graph network analysis." },
  { icon: MapPin, title: "Location Anomaly Detection", desc: "Identifies suspicious geo-location changes and impossible travel patterns instantly." },
  { icon: Smartphone, title: "Device Fingerprinting", desc: "Tracks device signatures to prevent account takeover and unauthorized access." },
  { icon: Zap, title: "Real-time Analysis", desc: "Every transaction analyzed in under 50ms with instant approval or block decisions." },
  { icon: RefreshCw, title: "Self-Learning Model", desc: "Continuous model retraining ensures evolving fraud tactics are always detected." },
];

const steps = [
  { icon: UserPlus, title: "Register & Verify", desc: "Create your secure account with identity verification" },
  { icon: Wallet, title: "Add Money", desc: "Fund your wallet through multiple payment methods" },
  { icon: Send, title: "Send Instantly", desc: "Transfer money to anyone in seconds" },
  { icon: Eye, title: "AI Monitors All", desc: "Every transaction is analyzed for fraud in real-time" },
];

const stats = [
  { value: 100000, suffix: "+", label: "Transactions Protected" },
  { value: 99.7, suffix: "%", label: "Fraud Detection Rate" },
  { value: 50, prefix: "< ", suffix: "ms", label: "Analysis Time" },
  { value: 5, suffix: "", label: "Fraud Pattern Types" },
];

const testimonials = [
  { name: "Sarah Chen", role: "CTO, PayFlow", quote: "FraudLens reduced our chargebacks by 94%. The AI detection is incredibly accurate.", rating: 5 },
  { name: "Marcus Rivera", role: "Head of Security, NeoBank", quote: "The graph analysis caught a sophisticated ring fraud scheme that our previous system completely missed.", rating: 5 },
  { name: "Priya Patel", role: "VP Engineering, FinServe", quote: "Integration was seamless. We went from POC to production in under a week.", rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold gradient-text">FraudLens</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="gradient" size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        {/* Animated BG orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary mb-8">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Fraud Detection
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
              Secure Payments.{" "}
              <span className="gradient-text">Zero Fraud.</span>
              <br />
              Pure Confidence.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              FraudLens uses advanced machine learning to analyze every transaction in real-time,
              detecting and blocking fraud before it happens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-base px-8" asChild>
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="hero-ghost" size="lg" className="text-base px-8">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Floating cards */}
          <div className="relative mt-16 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="glass-card rounded-2xl p-6 gradient-border"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Latest Transaction</span>
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Approved</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">₹24,500.00</p>
                  <p className="text-sm text-muted-foreground">To: Priya Sharma</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>AI Score: 0.02</p>
                  <p className="text-success">✓ Safe</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -left-4 sm:-left-12 top-1/2 -translate-y-1/2 glass-card rounded-xl p-4 animate-float"
            >
              <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                <Shield className="h-4 w-4" />
                Fraud Blocked
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -right-4 sm:-right-12 top-1/2 -translate-y-1/2 glass-card rounded-xl p-4 animate-float"
              style={{ animationDelay: "2s" }}
            >
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <Eye className="h-4 w-4" />
                AI Monitoring
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Intelligent Protection, <span className="gradient-text">Every Layer</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Six layers of AI-powered security work together to keep your money safe.
            </p>
          </div>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <GlassCard glow="primary" className="h-full">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How <span className="gradient-text">FraudLens</span> Works
            </h2>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-primary/20 hidden sm:block" />
            <StaggerContainer className="space-y-12">
              {steps.map((s, i) => (
                <StaggerItem key={s.title} className="flex items-start gap-6 relative">
                  <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shrink-0 z-10 shadow-lg shadow-primary/20">
                    <s.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-primary font-semibold uppercase tracking-wider">Step {i + 1}</span>
                    <h3 className="text-xl font-semibold mt-1 mb-1">{s.title}</h3>
                    <p className="text-muted-foreground">{s.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <GlassCard glow="primary" className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                    <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by <span className="gradient-text">Industry Leaders</span>
            </h2>
          </div>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <StaggerItem key={t.name}>
                <GlassCard glow="accent" className="h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold gradient-text">FraudLens</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 FraudLens. AI-Powered Fraud Detection.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
