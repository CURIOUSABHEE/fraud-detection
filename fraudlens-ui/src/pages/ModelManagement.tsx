import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cpu, CheckCircle, RefreshCw, Zap, BarChart3 } from "lucide-react";

const models = [
  {
    name: "Sunny Model",
    version: "v3.2.1",
    accuracy: 99.2,
    lastTrained: "Mar 10, 2026",
    active: true,
    versions: [
      { ver: "v3.2.1", date: "Mar 10, 2026", acc: 99.2, prec: 98.8, recall: 97.5, f1: 98.1 },
      { ver: "v3.1.0", date: "Feb 28, 2026", acc: 98.7, prec: 97.9, recall: 96.8, f1: 97.3 },
    ],
  },
  {
    name: "Abhishekh Amount",
    version: "v2.4.0",
    accuracy: 98.5,
    lastTrained: "Mar 8, 2026",
    active: false,
    versions: [
      { ver: "v2.4.0", date: "Mar 8, 2026", acc: 98.5, prec: 97.2, recall: 96.0, f1: 96.6 },
    ],
  },
  {
    name: "Abhishekh Ratio",
    version: "v1.8.3",
    accuracy: 97.8,
    lastTrained: "Mar 5, 2026",
    active: false,
    versions: [
      { ver: "v1.8.3", date: "Mar 5, 2026", acc: 97.8, prec: 96.5, recall: 95.2, f1: 95.8 },
    ],
  },
];

export default function ModelManagement() {
  const [selectedModel, setSelectedModel] = useState(0);
  const [ratio, setRatio] = useState(1.5);
  const [training, setTraining] = useState(false);

  const startTraining = () => {
    setTraining(true);
    setTimeout(() => setTraining(false), 3000);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Model Management</h1>

        {/* Model Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((m, i) => (
            <StaggerItem key={m.name}>
              <GlassCard
                glow={m.active ? "primary" : "none"}
                className={`cursor-pointer ${selectedModel === i ? "ring-1 ring-primary" : ""}`}
              >
                <div onClick={() => setSelectedModel(i)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-primary" />
                    </div>
                    {m.active && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold">{m.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Version: {m.version}</p>
                  <p className="text-xs text-muted-foreground">Last trained: {m.lastTrained}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-background/50 overflow-hidden">
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${m.accuracy}%` }} />
                    </div>
                    <span className="text-xs font-medium text-primary">{m.accuracy}%</span>
                  </div>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Version History */}
        <GlassCard hover={false}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {models[selectedModel].name} — Version History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  {["Version", "Date", "Accuracy", "Precision", "Recall", "F1 Score", ""].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models[selectedModel].versions.map((v, i) => (
                  <tr key={v.ver} className="border-b border-border/10">
                    <td className="py-3 px-3 font-mono text-xs">{v.ver}</td>
                    <td className="py-3 px-3 text-muted-foreground">{v.date}</td>
                    <td className="py-3 px-3 font-medium text-success">{v.acc}%</td>
                    <td className="py-3 px-3">{v.prec}%</td>
                    <td className="py-3 px-3">{v.recall}%</td>
                    <td className="py-3 px-3">{v.f1}%</td>
                    <td className="py-3 px-3">
                      {i === 0 && models[selectedModel].active ? (
                        <span className="text-xs text-success flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-xs">Activate</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Retrain */}
        <GlassCard hover={false}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" /> Retrain Model
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Select Model</Label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(Number(e.target.value))}
                  className="w-full h-10 rounded-lg bg-background/50 border border-border/50 px-3 text-sm text-foreground"
                >
                  {models.map((m, i) => <option key={m.name} value={i}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Balanced Ratio: {ratio.toFixed(1)}</Label>
                <input
                  type="range" min="0.5" max="3.0" step="0.1" value={ratio}
                  onChange={(e) => setRatio(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5</span><span>3.0</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Version Name</Label>
                <Input placeholder="e.g. v3.3.0" className="bg-background/50 border-border/50" />
              </div>
              <Button variant="gradient" onClick={startTraining} disabled={training}>
                {training ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Training...</>
                ) : (
                  <><Zap className="mr-2 h-4 w-4" /> Start Retraining</>
                )}
              </Button>
            </div>

            {training && (
              <div className="flex flex-col justify-center">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Training in progress...</p>
                  <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                    <div className="h-full rounded-full gradient-primary shimmer animate-pulse" style={{ width: "60%" }} />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 font-mono">
                    <p>[INFO] Loading dataset...</p>
                    <p>[INFO] Balancing classes (ratio: {ratio.toFixed(1)})...</p>
                    <p>[INFO] Training epoch 3/10...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
