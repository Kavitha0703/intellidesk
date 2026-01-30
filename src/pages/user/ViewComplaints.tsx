import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, SeverityBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash2, FileText } from 'lucide-react';

export default function ViewComplaints() {
  const { currentUser, complaints, setComplaints } = useApp();
  const { toast } = useToast();

  const userComplaints = complaints.filter(c => c.userName === currentUser);

  const handleDelete = (id: string) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
    toast({
      title: 'Complaint Deleted',
      description: 'Your complaint has been removed.',
    });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="My Complaints"
        description="Track and manage your submitted complaints."
        backHref="/user"
      />

      {userComplaints.length === 0 ? (
        <Card className="border-0 shadow-card animate-slide-up">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Complaints Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You haven't submitted any complaints. Click "Register Complaint" to submit your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-card animate-slide-up overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userComplaints.map((complaint, index) => (
                  <TableRow 
                    key={complaint.id}
                    className="animate-slide-in-left"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                    <TableCell>
                      {complaint.issueType}
                      {complaint.issueType === 'Other' && complaint.otherIssue && (
                        <span className="text-muted-foreground text-sm ml-1">
                          ({complaint.otherIssue})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={complaint.severity} />
                    </TableCell>
                    <TableCell>{complaint.date}</TableCell>
                    <TableCell>
                      <StatusBadge status={complaint.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {complaint.status === 'Pending' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(complaint.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
