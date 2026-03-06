import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, SeverityBadge } from '@/components/shared/StatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate } from '@/lib/utils';
import { Severity, ComplaintStatus } from '@/lib/types';
import { Eye, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ComplaintCardProps {
  id: string;
  issue_type: string;
  other_issue?: string | null;
  severity: Severity;
  status: ComplaintStatus;
  created_at: string;
  user_name?: string;
  email?: string;
  onView: () => void;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export function ComplaintCard({
  id,
  issue_type,
  other_issue,
  severity,
  status,
  created_at,
  user_name,
  email,
  onView,
  onDelete,
  selectable,
  selected,
  onToggleSelect,
}: ComplaintCardProps) {
  return (
    <Card className={`border-0 shadow-card animate-slide-up ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {selectable && (
              <Checkbox
                checked={selected}
                onCheckedChange={onToggleSelect}
              />
            )}
            <span className="font-mono text-xs text-muted-foreground">
              #{id.slice(0, 8)}
            </span>
          </div>
          <StatusBadge status={status} />
        </div>

        {user_name && (
          <div className="mb-2">
            <p className="text-sm font-medium">{user_name}</p>
            {email && <p className="text-xs text-muted-foreground">{email}</p>}
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {issue_type}
            {issue_type === 'Other' && other_issue && (
              <span className="text-muted-foreground ml-1">({other_issue})</span>
            )}
          </span>
          <SeverityBadge severity={severity} />
        </div>

        <p className="text-xs text-muted-foreground mb-3">{formatDate(created_at)}</p>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this complaint?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this complaint. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
