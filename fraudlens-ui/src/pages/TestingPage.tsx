import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Activity, BarChart3, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } }
};

export default function TestingPage() {
  const [activeTab, setActiveTab] = useState("fraud");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0050FF]/10 via-[#00D6FF]/5 to-[#00D6FF]/10 rounded-[32px] blur-3xl" />
        <div className="glass-hero rounded-[32px] p-10 relative overflow-hidden">
          <div className="flex items-center gap-5 relative z-10">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#0050FF] to-[#00D6FF] flex items-center justify-center shadow-[0_0_60px_rgba(0,80,255,0.3)]"
            >
              <FlaskConical className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase">System Testing</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30 mt-1">
                Fraud Detection · Performance · Security · Validation
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card-float rounded-2xl p-2 bg-white/[0.02] border border-white/5 h-auto flex-wrap gap-2">
            {[
              { value: "fraud", label: "Fraud Tests", icon: Shield },
              { value: "performance", label: "Performance", icon: BarChart3 },
              { value: "neural", label: "Neural Ops", icon: Activity },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-[#0050FF]/10 data-[state=active]:border-[#0050FF]/20 data-[state=active]:text-[#0050FF] border border-transparent rounded-xl px-6 py-3 text-white/30 hover:text-white/50 transition-all"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="fraud" className="space-y-6">
            <div className="glass-card-float rounded-[28px] p-8 border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#0050FF]/10 border border-[#0050FF]/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#0050FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tight">Fraud Detection Tests</h2>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">Validate fraud detection algorithms</p>
                </div>
              </div>
              <div className="space-y-4">
                {["Transaction Anomaly", "Pattern Recognition", "Velocity Checks"].map((test, i) => (
                  <motion.div
                    key={test}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                  >
                    <span className="text-sm font-bold text-white">{test}</span>
                    <span className="text-[9px] uppercase tracking-wider text-white/30 px-3 py-1 rounded-full bg-white/[0.03]">Ready</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="glass-card-float rounded-[28px] p-8 border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#0050FF]/10 border border-[#0050FF]/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-[#0050FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tight">Performance Tests</h2>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">System latency and throughput benchmarks</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Response Time", value: "24ms", color: "#00D6FF" },
                  { label: "Throughput", value: "1.2k/s", color: "#0050FF" },
                  { label: "Error Rate", value: "0.02%", color: "#0050FF" },
                ].map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/5"
                  >
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">{metric.label}</p>
                    <p className="text-2xl font-black text-white" style={{ color: metric.color }}>{metric.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="neural" className="space-y-6">
            <div className="glass-card-float rounded-[28px] p-8 border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#00D6FF]/10 border border-[#00D6FF]/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-[#00D6FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tight">Neural Operations</h2>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">Model inference and neural network tests</p>
                </div>
              </div>
              <div className="space-y-4">
                {["Inference Speed", "Model Accuracy", "Data Pipeline"].map((test, i) => (
                  <motion.div
                    key={test}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <span className="text-sm font-bold text-white">{test}</span>
                    <span className="text-[9px] uppercase tracking-wider text-white/30 px-3 py-1 rounded-full bg-white/[0.03]">Active</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
