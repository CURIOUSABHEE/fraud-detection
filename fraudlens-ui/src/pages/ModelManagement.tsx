import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Cpu, CheckCircle, RefreshCw, Zap, BarChart3, Loader2,
  Settings, AlertTriangle, Power, ListTree,
} from "lucide-react";
import { fastapi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface ModelVersion {
  version: string;
  path: string;
}

interface ModelInfo {
  id: string;
  name: string;
  features: string[];
  base_model_loaded: boolean;
  versions: ModelVersion[];
}

interface RetrainResult {
  success: boolean;
  model_id: string;
  version: string;
  saved_path: string;
  num_transactions_used: number;
  num_fraud: number;
  num_non_fraud: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function ModelManagement() {
  const [activeTab, setActiveTab] = useState<"retrain" | "manage">("retrain");
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [ratio, setRatio] = useState(1.5);
  const [versionName, setVersionName] = useState("");
  const [activatedVersions, setActivatedVersions] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /* ── Queries & Mutations ─────────────────────────────────────────────────── */
  const { data, isLoading, refetch } = useQuery<{ models: ModelInfo[] }>({
    queryKey: ["available-models"],
    queryFn: () => fastapi.get("/fastapi/available-models"),
  });

  const models = data?.models || [];
  const selected = models[selectedModelIdx];

  const retrainMutation = useMutation<
    RetrainResult,
    Error,
    { model_id: string; balanced_ratio: number; version_suffix?: string }
  >({
    mutationFn: (params) => fastapi.post("/fastapi/retrain-model", params),
    onSuccess: (result) => {
      toast({
        title: "Model Retrained Successfully",
        description: `${result.model_id} ${result.version} — Accuracy: ${(result.metrics.accuracy * 100).toFixed(1)}%`,
      });
      queryClient.invalidateQueries({ queryKey: ["available-models"] });
    },
    onError: (err) => {
      toast({ title: "Retraining Failed", description: err.message, variant: "destructive" });
    },
  });

  const activateMutation = useMutation<
    { success: boolean; model_id: string; version: string; message: string },
    Error,
    { model_id: string; version: string }
  >({
    mutationFn: (params) => fastapi.post("/fastapi/activate-model", params),
    onSuccess: (data, variables) => {
      setActivatedVersions((prev) => ({ ...prev, [variables.model_id]: variables.version }));
      toast({
        title: "Model Activated",
        description: `${variables.model_id} version ${variables.version} is now active`,
      });
      queryClient.invalidateQueries({ queryKey: ["available-models"] });
    },
    onError: (err) => {
      toast({ title: "Activation Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleRetrain = () => {
    if (!selected) return;
    retrainMutation.mutate({
      model_id: selected.id,
      balanced_ratio: ratio,
      version_suffix: versionName || undefined,
    });
  };

  /* ── Loading state ───────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Model Management</h1>
            <p className="text-sm text-muted-foreground">Retrain, activate, and manage fraud detection models</p>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="flex border-b border-border/30">
          {([
            { key: "retrain" as const, label: "Retrain Models", icon: RefreshCw },
            { key: "manage" as const, label: "Manage Versions", icon: ListTree },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/*  RETRAIN TAB                                                       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "retrain" && (
          <>
            {/* Model overview cards */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {models.map((m, i) => (
                <StaggerItem key={m.id}>
                  <GlassCard
                    glow={m.base_model_loaded ? "primary" : "none"}
                    className={`cursor-pointer transition-all ${selectedModelIdx === i ? "ring-1 ring-primary" : ""}`}
                  >
                    <div onClick={() => setSelectedModelIdx(i)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Cpu className="h-5 w-5 text-primary" />
                        </div>
                        {m.base_model_loaded ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 flex items-center gap-1">
                            <Power className="h-3 w-3" /> Loaded
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border/30">
                            Not Loaded
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold">{m.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">ID: {m.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.versions.length} version{m.versions.length !== 1 ? "s" : ""} &middot; {m.features.length} features
                      </p>
                    </div>
                  </GlassCard>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Retrain form */}
            <GlassCard hover={false}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" /> Retrain Model
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Select Model</Label>
                    <select
                      value={selectedModelIdx}
                      onChange={(e) => setSelectedModelIdx(Number(e.target.value))}
                      className="w-full h-10 rounded-lg bg-background/50 border border-border/50 px-3 text-sm text-foreground"
                    >
                      {models.map((m, i) => (
                        <option key={m.id} value={i}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Balanced Ratio (Non-Fraud to Fraud): {ratio.toFixed(1)}</Label>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={ratio}
                      onChange={(e) => setRatio(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.5</span><span>3.0</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 1.5 — For every fraud tx, use 1.5 non-fraud transactions
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Version Suffix (optional)</Label>
                    <Input
                      placeholder="e.g. v1, production, test"
                      value={versionName}
                      onChange={(e) => setVersionName(e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      A timestamp will be automatically added
                    </p>
                  </div>

                  {/* Selected model features */}
                  {selected && (
                    <div className="rounded-lg bg-background/50 border border-border/30 p-4">
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                        {selected.name} Features ({selected.features.length}):
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.features.map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded text-xs bg-primary/5 text-primary border border-primary/10"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="gradient"
                    onClick={handleRetrain}
                    disabled={retrainMutation.isPending}
                    className="w-full"
                  >
                    {retrainMutation.isPending ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Training...</>
                    ) : (
                      <><Zap className="mr-2 h-4 w-4" /> Start Retraining</>
                    )}
                  </Button>
                </div>

                {/* Right side — progress / results */}
                <div className="flex flex-col justify-center min-h-[200px]">
                  {retrainMutation.isPending && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Training in progress...</p>
                      <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                        <div className="h-full rounded-full gradient-primary shimmer animate-pulse" style={{ width: "60%" }} />
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1 font-mono">
                        <p>[INFO] Fetching transactions from database...</p>
                        <p>[INFO] Balancing classes (ratio: {ratio.toFixed(1)})...</p>
                        <p>[INFO] Training XGBoost model...</p>
                      </div>
                    </div>
                  )}

                  {retrainMutation.isSuccess && !retrainMutation.isPending && (
                    <div className="space-y-4 p-5 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Retraining Successful
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Model:</span>{" "}
                          <span className="font-medium">{retrainMutation.data.model_id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Version:</span>{" "}
                          <span className="font-mono">{retrainMutation.data.version}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transactions:</span>{" "}
                          <span className="font-medium">{retrainMutation.data.num_transactions_used}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fraud:</span>{" "}
                          <span className="font-medium">{retrainMutation.data.num_fraud}</span>
                        </div>
                      </div>

                      <div className="border-t border-success/20 pt-3">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          Performance Metrics
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            ["Accuracy", retrainMutation.data.metrics.accuracy],
                            ["Precision", retrainMutation.data.metrics.precision],
                            ["Recall", retrainMutation.data.metrics.recall],
                            ["F1 Score", retrainMutation.data.metrics.f1_score],
                          ] as const).map(([label, value]) => (
                            <div key={label} className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{label}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-background/50 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-success transition-all duration-500"
                                    style={{ width: `${value * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-14 text-right">
                                  {(value * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="gradient"
                          size="sm"
                          disabled={activateMutation.isPending}
                          onClick={() =>
                            activateMutation.mutate({
                              model_id: retrainMutation.data.model_id,
                              version: retrainMutation.data.version,
                            })
                          }
                        >
                          {activateMutation.isPending ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Power className="mr-2 h-3 w-3" />
                          )}
                          Activate This Version
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("manage")}
                        >
                          <ListTree className="mr-2 h-3 w-3" />
                          Manage Versions
                        </Button>
                      </div>
                    </div>
                  )}

                  {retrainMutation.isError && (
                    <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-sm font-medium text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Retraining Failed
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{retrainMutation.error.message}</p>
                    </div>
                  )}

                  {retrainMutation.isIdle && (
                    <div className="text-center text-muted-foreground">
                      <Cpu className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Select a model and click "Start Retraining"</p>
                      <p className="text-xs mt-1">
                        Models are retrained using transaction data from your database
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/*  MANAGE VERSIONS TAB                                               */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "manage" && (
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                All Model Versions
              </h3>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    {["Model Name", "Version", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <>
                      {/* Model group header */}
                      <tr key={`header-${model.id}`} className="bg-background/50">
                        <td colSpan={4} className="py-2.5 px-4 font-semibold text-sm flex items-center gap-2">
                          <Cpu className="h-3.5 w-3.5 text-primary" />
                          {model.name}
                          <span className="text-xs font-normal text-muted-foreground">({model.id})</span>
                        </td>
                      </tr>

                      {/* Base model row */}
                      <tr key={`base-${model.id}`} className="border-b border-border/10">
                        <td className="py-3 px-4">{model.name}</td>
                        <td className="py-3 px-4 font-mono text-xs">Base Model</td>
                        <td className="py-3 px-4">
                          {model.base_model_loaded ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                              <Power className="h-3 w-3" /> Loaded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border/30">
                              Not Loaded
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">—</td>
                      </tr>

                      {/* Version rows */}
                      {model.versions.map((v) => {
                        const isActive = activatedVersions[model.id] === v.version;
                        return (
                          <tr key={`${model.id}-${v.version}`} className="border-b border-border/10 hover:bg-background/30 transition-colors">
                            <td className="py-3 px-4">{model.name}</td>
                            <td className="py-3 px-4 font-mono text-xs">{v.version}</td>
                            <td className="py-3 px-4">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                  <CheckCircle className="h-3 w-3" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border/30">
                                  Available
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant={isActive ? "ghost" : "outline"}
                                size="sm"
                                className="text-xs h-7"
                                disabled={activateMutation.isPending || isActive}
                                onClick={() => activateMutation.mutate({ model_id: model.id, version: v.version })}
                              >
                                {activateMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Power className="h-3 w-3 mr-1" />
                                )}
                                {isActive ? "Activated" : "Activate"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* No versions message */}
                      {model.versions.length === 0 && (
                        <tr key={`empty-${model.id}`} className="border-b border-border/10">
                          <td colSpan={4} className="py-4 px-4 text-center text-muted-foreground text-xs">
                            No custom versions available. Retrain to create new versions.
                          </td>
                        </tr>
                      )}
                    </>
                  ))}

                  {models.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No models available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30">
              <Button variant="gradient" onClick={() => setActiveTab("retrain")}>
                <Zap className="mr-2 h-4 w-4" />
                Create New Version
              </Button>
            </div>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}
