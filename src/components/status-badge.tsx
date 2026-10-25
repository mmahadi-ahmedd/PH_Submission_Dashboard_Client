import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/types";

const styles: Record<SubmissionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  APPROVED: "bg-green-100 text-green-800 hover:bg-green-100",
  REJECTED: "bg-red-100 text-red-800 hover:bg-red-100",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <Badge variant="outline" className={`border-transparent ${styles[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}