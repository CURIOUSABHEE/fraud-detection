import { cn } from "@/lib/utils";

type Status = "success" | "pending" | "fraud" | "failed";

const statusStyles: Record<Status, string> = {
  success: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  fraud: "bg-destructive/10 text-destructive border-destructive/20",
  failed: "bg-muted/10 text-muted-foreground border-muted/20",
};

const statusLabels: Record<Status, string> = {
  success: "Success",
  pending: "Pending",
  fraud: "Fraud",
  failed: "Failed",
};

export const StatusBadge = ({ status }: { status: Status }) => (
  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", statusStyles[status])}>
    {statusLabels[status]}
  </span>
);
