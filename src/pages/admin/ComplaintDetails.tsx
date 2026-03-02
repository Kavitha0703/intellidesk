import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, SeverityBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ComplaintStatus, IssueType, Severity, StatusHistoryEntry } from '@/lib/types';
import { formatDate } from '@/lib/utils';
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
import { Trash2, ArrowLeft, Clock, User, Mail, Calendar, MessageSquare, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { ImageGallery } from '@/components/complaints/ImageGallery';

interface ComplaintData {
  id: string;
  user_name: string;
  email: string;
  issue_type: IssueType;
  other_issue: string | null;
  severity: Severity;
  description: string;
  status: ComplaintStatus;
  status_history: StatusHistoryEntry[];
  admin_comment: string | null;
  created_at: string;
  images: string[];
  image_notes: Record<string, string>;
}

export default function AdminComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Pending');
  const [adminComment, setAdminComment] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const statusOptions: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved'];

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const complaintData: ComplaintData = {
            id: data.id,
            user_name: data.user_name,
            email: data.email,
            issue_type: data.issue_type as IssueType,
            other_issue: data.other_issue,
            severity: data.severity as Severity,
            description: data.description,
            status: data.status as ComplaintStatus,
            status_history: (Array.isArray(data.status_history) ? data.status_history : []) as unknown as StatusHistoryEntry[],
            admin_comment: data.admin_comment,
            created_at: data.created_at,
            images: (data as any).images || [],
            image_notes: (data as any).image_notes || {},
          };
          setComplaint(complaintData);
          setNewStatus(complaintData.status);
          setAdminComment(complaintData.admin_comment || '');
        }
      } catch (error) {
        logError('Error fetching complaint:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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

  const handleStatusUpdate = async () => {
    if (newStatus === complaint.status && !statusNote) {
      toast({
        title: 'No Changes',
        description: 'Status is unchanged and no note was added.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const newHistoryEntry: StatusHistoryEntry = {
        status: newStatus,
        date: new Date().toISOString(),
        note: statusNote || `Status changed to ${newStatus}`,
      };

      const updatedHistory = [...complaint.status_history, newHistoryEntry];

      const { error } = await supabase
        .from('complaints')
        .update({
          status: newStatus,
          status_history: JSON.parse(JSON.stringify(updatedHistory)),
        })
        .eq('id', complaint.id);

      if (error) throw error;

      setComplaint({
        ...complaint,
        status: newStatus,
        status_history: updatedHistory,
      });
      setStatusNote('');
      toast({
        title: 'Status Updated Successfully',
        description: `Complaint status changed to ${newStatus}.`,
      });
    } catch (error) {
      logError('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveComment = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ admin_comment: adminComment })
        .eq('id', complaint.id);

      if (error) throw error;

      setComplaint({ ...complaint, admin_comment: adminComment });
      toast({
        title: 'Comment Saved Successfully',
        description: 'Resolution note has been saved and is now visible to the user.',
      });
    } catch (error) {
      logError('Error saving comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', complaint.id);

      if (error) throw error;

      toast({
        title: 'Complaint Deleted Successfully',
        description: 'The complaint has been permanently removed.',
      });
      navigate('/admin/manage-complaints');
    } catch (error) {
      logError('Error deleting complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete complaint. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={`Complaint ${complaint.id.slice(0, 8)}...`}
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
                    <p className="font-medium">{complaint.user_name}</p>
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
                    {complaint.issue_type}
                    {complaint.issue_type === 'Other' && complaint.other_issue && (
                      <span className="text-muted-foreground"> ({complaint.other_issue})</span>
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

              {complaint.images && complaint.images.length > 0 && (
                <div className="p-3 rounded-lg bg-secondary/50">
                  <ImageGallery images={complaint.images} imageNotes={complaint.image_notes} />
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Submitted: {formatDate(complaint.created_at)}</span>
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
              <Button onClick={handleSaveComment} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Comment
              </Button>
            </CardContent>
          </Card>

          {/* Status History Timeline */}
          {complaint.status_history && complaint.status_history.length > 0 && (
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
                    {complaint.status_history.map((entry, index) => (
                      <div key={index} className="relative pl-8">
                        <div className="absolute left-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={entry.status} />
                            <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
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

              <Button onClick={handleStatusUpdate} className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
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
                      This will permanently delete this complaint. This action cannot be undone.
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
