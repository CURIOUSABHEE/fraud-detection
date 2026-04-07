import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { api, fastapi } from "@/lib/api";
import {
  AlertTriangle, CheckCircle, XCircle, FlaskConical, ArrowRight,
  BarChart3, Loader2, List, LayoutGrid, Cpu, RefreshCw,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface FieldMeta {
  label: string;
  type: "number" | "toggle" | "range" | "select";
  default: number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: number; label: string }[];
}

interface ModelInfo {
  id: string;
  name: string;
  features: string[];
  form_fields: string[];
  base_model_loaded: boolean;
}

interface AvailableModelsResponse {
  models: ModelInfo[];
  field_metadata: Record<string, FieldMeta>;
}

interface PredictionResult {
  is_fraud: boolean;
  probability: number;
  model_name: string;
  features_used: number;
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function FraudTestingPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<"all" | "single">("all");
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [form, setForm] = useState<Record<string, any>>({});
  const [view, setView] = useState<"cards" | "table">("cards");
  const [results, setResults] = useState<Record<string, PredictionResult> | null>(null);

  /* ── Fetch models + field metadata dynamically from backend ──────────────── */
  const { data, isLoading: modelsLoading, refetch } = useQuery<AvailableModelsResponse>({
    queryKey: ["available-models-testing"],
    queryFn: () => fastapi.get("/fastapi/available-models"),
  });

  const models = data?.models || [];
  const fieldMeta = data?.field_metadata || {};
  const selectedModel = models[selectedModelIdx];

  // Initialize form defaults from field_metadata when data loads
  useEffect(() => {
    if (!data?.field_metadata) return;
    const defaults: Record<string, any> = {};
    for (const [field, meta] of Object.entries(data.field_metadata)) {
      defaults[field] = meta.default;
    }
    setForm(defaults);
  }, [data?.field_metadata]);

  /* ── Compute which fields to show ────────────────────────────────────────── */
  // Build a map: field_name → list of model ids that use it
  const fieldToModels = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const m of models) {
      for (const f of m.form_fields) {
        if (!map[f]) map[f] = [];
        map[f].push(m.id);
      }
    }
    return map;
  }, [models]);

  // All unique fields across all models (preserving order)
  const allFields = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const m of models) {
      for (const f of m.form_fields) {
        if (!seen.has(f)) {
          seen.add(f);
          result.push(f);
        }
      }
    }
    return result;
  }, [models]);

  // Fields common to ALL models
  const commonFields = useMemo(() => {
    if (models.length === 0) return [];
    return allFields.filter((f) => fieldToModels[f]?.length === models.length);
  }, [allFields, fieldToModels, models.length]);

  // Fields specific to each model (not common)
  const modelSpecificFields = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const m of models) {
      map[m.id] = m.form_fields.filter((f) => !commonFields.includes(f));
    }
    return map;
  }, [models, commonFields]);

  // Should a field be visible right now?
  const shouldShow = (field: string) => {
    if (tab === "all") return true;
    return selectedModel?.form_fields.includes(field) ?? false;
  };

  /* ── Prediction mutation ─────────────────────────────────────────────────── */
  const mutation = useMutation<Record<string, PredictionResult>, Error, void>({
    mutationFn: async () => {
      const endpoint =
        tab === "all"
          ? "/models/test-all-models"
          : `/models/test-model/${selectedModel?.id}`;
      return api.post<Record<string, PredictionResult>>(endpoint, form, token);
    },
    onSuccess: (data) => setResults(data),
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  /* ── Visual helpers ──────────────────────────────────────────────────────── */
  const statusColor = (fraud: boolean, p: number) =>
    fraud
      ? "bg-destructive/10 border-destructive/30 text-destructive"
      : p > 0.3
        ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
        : "bg-success/10 border-success/30 text-success";

  const barColor = (p: number) =>
    p > 0.7 ? "bg-destructive" : p > 0.3 ? "bg-yellow-500" : "bg-success";

  const StatusIcon = ({ fraud, prob }: { fraud: boolean; prob: number }) =>
    fraud ? (
      <XCircle className="h-5 w-5 text-destructive" />
    ) : prob > 0.3 ? (
      <AlertTriangle className="h-5 w-5 text-yellow-500" />
    ) : (
      <CheckCircle className="h-5 w-5 text-success" />
    );

  /* ── Dynamic field renderer ────────────────────────────────────────────── */
  const renderField = (fieldName: string) => {
    if (!shouldShow(fieldName)) return null;
    const meta = fieldMeta[fieldName];
    if (!meta) return null;

    if (meta.type === "select" && meta.options) {
      return (
        <div key={fieldName} className="space-y-1.5">
          <Label htmlFor={fieldName}>{meta.label}</Label>
          <select
            id={fieldName}
            value={form[fieldName] ?? meta.default}
            onChange={(e) => set(fieldName, parseInt(e.target.value))}
            className="w-full h-10 rounded-lg bg-background/50 border border-border/50 px-3 text-sm text-foreground"
          >
            {meta.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (meta.type === "toggle") {
      return (
        <div key={fieldName} className="flex items-center justify-between rounded-lg border border-border/50 p-3 bg-background/50">
          <Label htmlFor={fieldName} className="cursor-pointer">{meta.label}</Label>
          <Switch
            id={fieldName}
            checked={!!form[fieldName]}
            onCheckedChange={(v) => set(fieldName, v)}
          />
        </div>
      );
    }

    if (meta.type === "range") {
      const min = meta.min ?? 0;
      const max = meta.max ?? 1;
      const step = meta.step ?? 0.01;
      return (
        <div key={fieldName} className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor={fieldName}>{meta.label}</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {Number(form[fieldName] ?? meta.default).toFixed(2)}
            </span>
          </div>
          <input
            id={fieldName}
            type="range"
            min={min}
            max={max}
            step={step}
            value={form[fieldName] ?? meta.default}
            onChange={(e) => set(fieldName, parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min}</span><span>{max}</span>
          </div>
        </div>
      );
    }

    // Default: number field
    return (
      <div key={fieldName} className="space-y-1.5">
        <Label htmlFor={fieldName}>{meta.label}</Label>
        <Input
          id={fieldName}
          type="number"
          step={meta.step}
          min={meta.min}
          max={meta.max}
          value={form[fieldName] ?? meta.default}
          onChange={(e) =>
            set(fieldName, meta.step && meta.step < 1
              ? parseFloat(e.target.value)
              : parseInt(e.target.value))
          }
          className="bg-background/50 border-border/50"
        />
      </div>
    );
  };

  /* ── Loading state ───────────────────────────────────────────────────────── */
  if (modelsLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  if (models.length === 0) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No models available. Check if the backend is running.</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </PageTransition>
    );
  }

  /* ── Render ───────────────────────────────────────────────────────────────── */
  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Model Evaluation</h1>
              <p className="text-sm text-muted-foreground">
                Test and compare fraud detection models ({models.length} loaded)
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <GlassCard hover={false}>
          <div className="flex border-b border-border/30 -mx-6 -mt-6 mb-6">
            {(["all", "single"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setResults(null); }}
                className={`flex-1 py-3 text-sm font-medium text-center transition-all border-b-2 ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t === "all" ? "Test All Models" : "Test Single Model"}
              </button>
            ))}
          </div>

          {/* Model selector (single mode) — populated dynamically */}
          {tab === "single" && (
            <div className="mb-6">
              <Label>Select Model</Label>
              <select
                value={selectedModelIdx}
                onChange={(e) => { setSelectedModelIdx(Number(e.target.value)); setResults(null); }}
                className="w-full h-10 mt-1.5 rounded-lg bg-background/50 border border-border/50 px-3 text-sm text-foreground"
              >
                {models.map((m, i) => (
                  <option key={m.id} value={i}>
                    {m.name} — {m.form_fields.length} features
                    {!m.base_model_loaded ? " (not loaded)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            className="space-y-8"
          >
            {/* Common parameters (fields shared by all models) */}
            {commonFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Common Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {commonFields.map(renderField)}
                </div>
              </div>
            )}

            {/* Per-model specific fields — rendered dynamically */}
            {models.map((m) => {
              const specificFields = modelSpecificFields[m.id] || [];
              if (specificFields.length === 0) return null;
              // In single mode, only show selected model's section
              if (tab === "single" && m.id !== selectedModel?.id) return null;

              return (
                <div key={m.id} className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5" />
                    {m.name} ({m.form_fields.length} features)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specificFields.map(renderField)}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                disabled={mutation.isPending}
                className="min-w-[200px]"
              >
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</>
                ) : (
                  <>
                    <span>Test {tab === "all" ? "All Models" : "Selected Model"}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Error */}
        {mutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Prediction Failed</p>
              <p className="text-sm text-muted-foreground mt-1">{mutation.error.message}</p>
            </div>
          </div>
        )}

        {/* View toggle (only for all-models mode with results) */}
        {results && tab === "all" && (
          <div className="flex justify-end gap-1">
            {([["cards", LayoutGrid], ["table", List]] as const).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v as "cards" | "table")}
                className={`p-2 rounded-lg transition-all ${view === v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}

        {/* ── Card View ──────────────────────── */}
        {results && (view === "cards" || tab === "single") && (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results).map(([key, r]) => (
              <StaggerItem key={key}>
                <GlassCard>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold">{r.model_name}</h3>
                    <StatusIcon fraud={r.is_fraud} prob={r.probability} />
                  </div>

                  <div className={`rounded-lg border p-3 mb-4 ${statusColor(r.is_fraud, r.probability)}`}>
                    <span className="font-medium text-sm">
                      {r.is_fraud ? "Fraud Detected" : "No Fraud Detected"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fraud Probability</span>
                      <span className="font-medium">{(r.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor(r.probability)}`}
                        style={{ width: `${Math.max(r.probability * 100, 2)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.features_used} features evaluated
                    </p>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* ── Table View ─────────────────────── */}
        {results && view === "table" && tab === "all" && (
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Model Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    {["Model", "Prediction", "Probability", "Features"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results).map(([key, r]) => (
                    <tr key={key} className={`border-b border-border/10 ${r.is_fraud ? "bg-destructive/5" : ""}`}>
                      <td className="py-3 px-3 font-medium">{r.model_name}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.is_fraud ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                          {r.is_fraud ? "Fraud Detected" : "No Fraud"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono ${r.probability > 0.7 ? "bg-destructive/10 text-destructive" : r.probability > 0.3 ? "bg-yellow-500/10 text-yellow-500" : "bg-success/10 text-success"}`}>
                          {(r.probability * 100).toFixed(4)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{r.features_used}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}
