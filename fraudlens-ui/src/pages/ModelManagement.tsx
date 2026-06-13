import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cpu, CheckCircle, RefreshCw, Zap, BarChart3, Activity, Database, Shield, Settings, Tag, Layers, GitBranch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModelVersion {
  ver: string;
  date: string;
  acc: number;
  prec: number;
  recall: number;
  f1: number;
}

interface Model {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  lastTrained: string;
  active: boolean;
  versions: ModelVersion[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } }
};

export default function ModelManagement() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [ratio, setRatio] = useState(1.5);
  const [versionName, setVersionName] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: models = [], isLoading } = useQuery<Model[]>({
    queryKey: ["models"],
    queryFn: () => api.get<Model[]>("/models", token),
    enabled: !!token,
  });

  const switchMutation = useMutation({
    mutationFn: (modelId: string) => api.post(`/models/switch/${modelId}`, {}, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast.success("Model activated successfully");
    },
    onError: () => toast.error("Failed to switch model"),
  });

  const retrainMutation = useMutation({
    mutationFn: () => api.post<{ success: boolean; model: Model }>("/models/retrain", {
      modelId: models[selectedModelIdx]?.id,
      versionName: versionName || undefined,
      ratio,
    }, token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      if (data.model) {
        const idx = models.findIndex(m => m.id === data.model.id);
        if (idx >= 0) setSelectedModelIdx(idx);
      }
      toast.success("Model retrained successfully");
    },
    onError: () => toast.error("Failed to retrain model"),
  });

  const activeModel = models[selectedModelIdx];

  const handleActivate = (idx: number) => {
    const model = models[idx];
    if (model && !model.active) {
      switchMutation.mutate(model.id);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Header with Tabs */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0050FF]/10 via-[#00D6FF]/5 to-[#00D6FF]/10 rounded-[32px] blur-3xl" />

        <div className="glass-hero rounded-[32px] p-10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#0050FF] to-[#00D6FF] flex items-center justify-center shadow-[0_0_60px_rgba(0,80,255,0.3)]"
              >
                <Cpu className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Neural Model Operations</h1>
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30 mt-1">
                  Model Configuration · Training Pipeline · Performance Analytics
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="glass-card-float rounded-2xl p-2 bg-white/[0.02] border border-white/5 h-auto">
                {[
                  { value: "overview", label: "Overview", icon: BarChart3 },
                  { value: "versions", label: "Manage Versions", icon: GitBranch },
                  { value: "features", label: "Feature Tags", icon: Tag },
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
            </Tabs>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Model Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {isLoading
              ? Array(3).fill(null).map((_, i) => (
                  <motion.div key={i} className="glass-card-float rounded-[24px] p-6 h-48 animate-pulse">
                    <div className="h-12 w-12 bg-white/5 rounded-2xl mb-4" />
                    <div className="h-6 bg-white/5 rounded w-32 mb-2" />
                    <div className="h-4 bg-white/5 rounded w-24 mb-4" />
                    <div className="h-2 bg-white/5 rounded-full" />
                  </motion.div>
                ))
              : models.map((m, i) => (
                  <motion.div
                    key={m.id}
                    variants={itemVariants}
                    custom={i}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => setSelectedModelIdx(i)}
                    className={`glass-card-float rounded-[24px] p-6 border cursor-pointer transition-all ${
                      selectedModelIdx === i
                        ? "border-[#0050FF]/30 shadow-[0_0_40px_rgba(0,80,255,0.15)]"
                        : "border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0050FF]/20 to-[#0050FF]/5 border border-[#0050FF]/20 flex items-center justify-center">
                        <Cpu className="h-6 w-6 text-[#0050FF]" />
                      </div>
                      {m.active && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D278]/10 border border-[#00D278]/20">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#00D278] animate-pulse" />
                          <span className="text-[8px] uppercase tracking-[0.15em] font-black text-[#00D278]">Active</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-white mb-1">{m.name}</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Version {m.version}</p>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider mb-4">Trained {m.lastTrained}</p>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.accuracy}%` }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#0050FF] to-[#00D6FF]"
                          style={{ boxShadow: "0 0 10px rgba(0,80,255,0.5)" }}
                        />
                      </div>
                      <span className="text-sm font-black text-white">{m.accuracy}%</span>
                    </div>
                  </motion.div>
                ))}
          </motion.div>
        </TabsContent>

        {/* Manage Versions Tab */}
        <TabsContent value="versions" className="space-y-8">
          {/* Version History */}
          <motion.div variants={itemVariants} className="glass-card-float rounded-[28px] p-8 border border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-[#00D6FF]/10 border border-[#00D6FF]/20 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-[#00D6FF]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">{activeModel?.name ?? "—"} — Version History</h2>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Performance metrics across training iterations</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Version", "Date", "Accuracy", "Precision", "Recall", "F1 Score", ""].map((h) => (
                      <th key={h} className="text-left py-4 px-4 text-[9px] uppercase tracking-[0.2em] font-black text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array(2).fill(null).map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {Array(7).fill(null).map((_, j) => (
                          <td key={j} className="py-4 px-4"><div className="h-4 bg-white/5 rounded w-16 animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  ) : activeModel?.versions.map((v, i) => (
                    <motion.tr
                      key={v.ver}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-4 font-mono text-sm font-bold text-white">{v.ver}</td>
                      <td className="py-4 px-4 text-sm text-white/40">{v.date}</td>
                      <td className="py-4 px-4 font-bold text-[#00D278]">{v.acc}%</td>
                      <td className="py-4 px-4 text-sm text-white/60">{v.prec}%</td>
                      <td className="py-4 px-4 text-sm text-white/60">{v.recall}%</td>
                      <td className="py-4 px-4 text-sm text-white/60">{v.f1}%</td>
                      <td className="py-4 px-4">
                        {i === 0 && activeModel.active ? (
                          <div className="flex items-center gap-2 text-[#00D278]">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Current</span>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleActivate(selectedModelIdx)}
                            disabled={switchMutation.isPending}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[9px] uppercase tracking-wider font-bold transition-all"
                          >
                            Activate
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Retrain Model */}
          <motion.div variants={itemVariants} className="glass-card-float rounded-[28px] p-8 border border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-[#00D6FF]/10 border border-[#00D6FF]/20 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-[#00D6FF]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Retrain Model</h2>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Configure and initiate model training pipeline</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 ml-1">Select Model</Label>
                  <select
                    value={selectedModelIdx}
                    onChange={(e) => setSelectedModelIdx(Number(e.target.value))}
                    className="w-full h-14 rounded-2xl bg-white/[0.02] border border-white/5 text-white px-5 text-sm focus:border-white/20 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "1rem" }}
                  >
                    {models.map((m, i) => <option key={m.id} value={i}>{m.name}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 ml-1">Balanced Ratio</Label>
                    <span className="text-sm font-black text-white">{ratio.toFixed(1)}</span>
                  </div>
                  <input
                    type="range" min="0.5" max="3.0" step="0.1" value={ratio}
                    onChange={(e) => setRatio(Number(e.target.value))}
                    className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  />
                  <div className="flex justify-between text-[9px] text-white/20 uppercase tracking-wider">
                    <span>0.5</span><span>3.0</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 ml-1">Version Name</Label>
                  <Input
                    placeholder="e.g. v3.4.2"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    className="h-14 bg-white/[0.02] border-white/5 focus:border-white/20 text-white rounded-2xl"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => retrainMutation.mutate()}
                  disabled={retrainMutation.isPending || models.length === 0}
                  className="w-full h-14 bg-gradient-to-r from-[#0050FF] to-[#00D6FF] text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(0,80,255,0.3)]"
                >
                  {retrainMutation.isPending ? (
                    <><RefreshCw className="h-5 w-5 animate-spin" /> Training...</>
                  ) : (
                    <><Zap className="h-5 w-5 fill-white" /> Start Retraining</>
                  )}
                </motion.button>
              </div>

              {/* Training Output */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 bg-black/30 min-h-[200px]">
                {retrainMutation.isPending ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-3 w-3 rounded-full bg-[#00D278] animate-pulse" />
                      <span className="text-sm font-bold text-white">Training in progress...</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#0050FF] to-[#00D6FF]"
                        animate={{ width: ["40%", "70%", "90%"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div className="space-y-2 font-mono text-[10px] text-white/40">
                      <p>[INFO] Loading dataset...</p>
                      <p>[INFO] Balancing classes (ratio: {ratio.toFixed(1)})...</p>
                      <p className="text-[#00D278]">[INFO] Training epoch 3/10...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Database className="h-12 w-12 text-white/10 mb-4" />
                    <p className="text-sm text-white/30">Training output will appear here</p>
                    <p className="text-[9px] text-white/20 mt-1 uppercase tracking-wider">Execute retraining to see logs</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Feature Tags Tab */}
        <TabsContent value="features" className="space-y-8">
          <motion.div variants={itemVariants} className="glass-card-float rounded-[28px] p-8 border border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-[#00D278]/10 border border-[#00D278]/20 flex items-center justify-center">
                <Tag className="h-5 w-5 text-[#00D278]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Feature Tags</h2>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Manage model feature flags and tags</p>
              </div>
            </div>

            <div className="space-y-6">
              {models.map((model, idx) => (
                <div key={model.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-white uppercase">{model.name}</h3>
                    {model.active && (
                      <span className="text-[8px] uppercase tracking-[0.15em] font-black text-[#00D278] px-3 py-1 rounded-full bg-[#00D278]/10 border border-[#00D278]/20">Active</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Fraud Detection", "Anomaly Detection", "Real-time Scoring", "Batch Processing", "Neural Network", "Gradient Boosting"].map((feature, i) => (
                      <span
                        key={i}
                        className={`text-[9px] uppercase tracking-wider font-bold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                          i < 3
                            ? "bg-[#0050FF]/10 border-[#0050FF]/20 text-[#0050FF]"
                            : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20 hover:text-white/50"
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
