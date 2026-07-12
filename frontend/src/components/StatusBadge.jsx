import { Badge } from "@/components/ui/badge";
import { statusTone } from "@/utils/constants";

export function StatusBadge({ status, className }) {
  return (
    <Badge variant={statusTone(status)} className={className}>
      {status}
    </Badge>
  );
}
