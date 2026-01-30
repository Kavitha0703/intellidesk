import { Badge } from '@/components/ui/badge';
import { ComplaintStatus, Severity } from '@/lib/types';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = {
    'Pending': 'pending',
    'In Progress': 'inProgress',
    'Resolved': 'resolved',
  }[status] as 'pending' | 'inProgress' | 'resolved';

  return <Badge variant={variant}>{status}</Badge>;
}

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const variant = {
    'Not Urgent': 'notUrgent',
    'Medium': 'medium',
    'Urgent': 'urgent',
    'Critical': 'critical',
  }[severity] as 'notUrgent' | 'medium' | 'urgent' | 'critical';

  return <Badge variant={variant}>{severity}</Badge>;
}
