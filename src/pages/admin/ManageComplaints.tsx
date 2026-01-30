import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, SeverityBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Severity, ComplaintStatus } from '@/lib/types';
import { Trash2, Filter, ClipboardList } from 'lucide-react';

export default function ManageComplaints() {
  const { complaints, setComplaints } = useApp();
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');

  const filteredComplaints = severityFilter === 'All'
    ? complaints
    : complaints.filter(c => c.severity === severityFilter);

  const handleStatusChange = (id: string, newStatus: ComplaintStatus) => {
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
    );
    toast({
      title: 'Status Updated',
      description: `Complaint ${id} status changed to ${newStatus}.`,
    });
  };

  const handleDelete = (id: string) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
    toast({
      title: 'Complaint Deleted',
      description: `Complaint ${id} has been removed.`,
    });
  };

  const severityLevels: (Severity | 'All')[] = ['All', 'Not Urgent', 'Medium', 'Urgent', 'Critical'];
  const statusOptions: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved'];

  return (
    <DashboardLayout>
      <PageHeader
        title="Manage Complaints"
        description="Review, update status, and manage all IT complaints."
        backHref="/admin"
      />

      {/* Filter */}
      <Card className="border-0 shadow-card mb-6 animate-slide-up">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Severity:</span>
            <Select
              value={severityFilter}
              onValueChange={(value) => setSeverityFilter(value as Severity | 'All')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {severityLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-auto">
              Showing {filteredComplaints.length} of {complaints.length} complaints
            </span>
          </div>
        </CardContent>
      </Card>

      {filteredComplaints.length === 0 ? (
        <Card className="border-0 shadow-card animate-slide-up">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Complaints Found</h3>
            <p className="text-muted-foreground text-center">
              {severityFilter === 'All' 
                ? 'There are no complaints in the system.'
                : `No complaints with ${severityFilter} severity.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-card animate-slide-up overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="max-w-[200px]">Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint, index) => (
                    <TableRow 
                      key={complaint.id}
                      className="animate-slide-in-left"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{complaint.userName}</div>
                          <div className="text-xs text-muted-foreground">{complaint.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {complaint.issueType}
                        {complaint.issueType === 'Other' && complaint.otherIssue && (
                          <span className="text-muted-foreground text-sm block">
                            ({complaint.otherIssue})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={complaint.severity} />
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm" title={complaint.description}>
                          {complaint.description}
                        </p>
                      </TableCell>
                      <TableCell>{complaint.date}</TableCell>
                      <TableCell>
                        <Select
                          value={complaint.status}
                          onValueChange={(value) => handleStatusChange(complaint.id, value as ComplaintStatus)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <StatusBadge status={complaint.status} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(complaint.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
