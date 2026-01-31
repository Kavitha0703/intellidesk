import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, SeverityBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ComplaintStatus } from '@/lib/types';
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
import { Trash2, ArrowLeft, Clock, User, Mail, Calendar, MessageSquare, AlertTriangle, Save } from 'lucide-react';

export default function AdminComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { complaints, setComplaints } = useApp();
  const { toast } = useToast();
  
  const complaint = complaints.find(c => c.id === id);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint?.status || 'Pending');
  const [adminComment, setAdminComment] = useState(complaint?.adminComment || '');
  const [statusNote, setStatusNote] = useState('');

  const statusOptions: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved'];

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Complaint Not Found</h2>
          <p className="text-muted-foreground mb-4">This complaint doesn't exist.</p>
          <Button onClick={() => navigate('/admin/manage-complaints')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Complaints
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusUpdate = () => {
    if (newStatus === complaint.status && !statusNote) {
      toast({
        title: 'No Changes',
        description: 'Status is unchanged and no note was added.',
        variant: 'destructive',
      });
      return;
    }

    const newHistoryEntry = {
      status: newStatus,
      date: new Date().toISOString().split('T')[0],
      note: statusNote || `Status changed to ${newStatus}`,
    };

    setComplaints(prev =>
      prev.map(c =>
        c.id === complaint.id
          ? {
              ...c,
              status: newStatus,
              statusHistory: [...(c.statusHistory || []), newHistoryEntry],
            }
          : c
      )
    );

    setStatusNote('');
    toast({
      title: 'Status Updated',
      description: `Complaint ${complaint.id} status changed to ${newStatus}.`,
    });
  };

  const handleSaveComment = () => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaint.id
          ? { ...c, adminComment }
          : c
      )
    );
    toast({
      title: 'Comment Saved',
      description: 'Resolution note has been saved successfully.',
    });
  };

  const handleDelete = () => {
    setComplaints(prev => prev.filter(c => c.id !== complaint.id));
    toast({
      title: 'Complaint Deleted',
      description: `Complaint ${complaint.id} has been removed.`,
    });
    navigate('/admin/manage-complaints');
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={`Complaint ${complaint.id}`}
        description="View and manage complaint details."
        backHref="/admin/manage-complaints"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-card animate-slide-up">
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">User Name</p>
                    <p className="font-medium">{complaint.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{complaint.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Issue Type</p>
                  <p className="font-medium">
                    {complaint.issueType}
                    {complaint.issueType === 'Other' && complaint.otherIssue && (
                      <span className="text-muted-foreground"> ({complaint.otherIssue})</span>
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Severity</p>
                  <SeverityBadge severity={complaint.severity} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-foreground">{complaint.description}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Submitted: {complaint.date}</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Resolution Note */}
          <Card className="border-0 shadow-card animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Resolution Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminComment">Admin Comment (visible to user)</Label>
                <Textarea
                  id="adminComment"
                  placeholder="Add a resolution note or comment for the user..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={handleSaveComment}>
                <Save className="mr-2 h-4 w-4" />
                Save Comment
              </Button>
            </CardContent>
          </Card>

          {/* Status History Timeline */}
          {complaint.statusHistory && complaint.statusHistory.length > 0 && (
            <Card className="border-0 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-4">
                    {complaint.statusHistory.map((entry, index) => (
                      <div key={index} className="relative pl-8">
                        <div className="absolute left-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={entry.status} />
                            <span className="text-sm text-muted-foreground">{entry.date}</span>
                          </div>
                          {entry.note && <p className="text-sm">{entry.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card className="border-0 shadow-card animate-slide-up">
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-2">
                <StatusBadge status={complaint.status} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Change Status</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ComplaintStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusNote">Status Note (optional)</Label>
                <Textarea
                  id="statusNote"
                  placeholder="Add a note for this status change..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <Button onClick={handleStatusUpdate} className="w-full">
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-0 shadow-card animate-slide-up border-destructive/20" style={{ animationDelay: '50ms' }}>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Delete this complaint permanently. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Complaint
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete complaint {complaint.id}. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
