import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, SeverityBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { IssueType, Severity } from '@/lib/types';
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
import { Pencil, Trash2, ArrowLeft, Clock, User, Mail, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';

export default function ComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, complaints, setComplaints } = useApp();
  const { toast } = useToast();
  
  const complaint = complaints.find(c => c.id === id && c.userName === currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: complaint?.email || '',
    issueType: complaint?.issueType || '' as IssueType,
    otherIssue: complaint?.otherIssue || '',
    severity: complaint?.severity || '' as Severity,
    description: complaint?.description || '',
  });

  const issueTypes: IssueType[] = ['System', 'Internet', 'Software', 'Hardware', 'Other'];
  const severityLevels: Severity[] = ['Not Urgent', 'Medium', 'Urgent', 'Critical'];

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Complaint Not Found</h2>
          <p className="text-muted-foreground mb-4">This complaint doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/user/view-complaints')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Complaints
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const canEdit = complaint.status === 'Pending';
  const isReadOnly = complaint.status === 'Resolved';

  const handleSave = () => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaint.id
          ? {
              ...c,
              email: editData.email,
              issueType: editData.issueType,
              otherIssue: editData.otherIssue,
              severity: editData.severity,
              description: editData.description,
            }
          : c
      )
    );
    setIsEditing(false);
    toast({
      title: 'Complaint Updated',
      description: 'Your complaint has been updated successfully.',
    });
  };

  const handleDelete = () => {
    setComplaints(prev => prev.filter(c => c.id !== complaint.id));
    toast({
      title: 'Complaint Deleted',
      description: 'Your complaint has been removed successfully.',
    });
    navigate('/user/view-complaints');
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={`Complaint ${complaint.id}`}
        description="View complete details of your submitted complaint."
        backHref="/user/view-complaints"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Complaint Details</CardTitle>
              {canEdit && !isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issueType">Issue Type</Label>
                      <Select
                        value={editData.issueType}
                        onValueChange={(value) => setEditData({ ...editData, issueType: value as IssueType })}
                      >
                        <SelectTrigger id="issueType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {issueTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {editData.issueType === 'Other' && (
                    <div className="space-y-2">
                      <Label htmlFor="otherIssue">Specify Other Issue</Label>
                      <Input
                        id="otherIssue"
                        value={editData.otherIssue}
                        onChange={(e) => setEditData({ ...editData, otherIssue: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={editData.severity}
                      onValueChange={(value) => setEditData({ ...editData, severity: value as Severity })}
                    >
                      <SelectTrigger id="severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {severityLevels.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
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

                  {complaint.adminComment && (
                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-primary">Admin Resolution Note</p>
                      </div>
                      <p className="text-foreground">{complaint.adminComment}</p>
                    </div>
                  )}
                </>
              )}
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
          <Card className="border-0 shadow-card animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <StatusBadge status={complaint.status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Submitted: {formatDate(complaint.date)}</span>
              </div>
              {isReadOnly && (
                <div className="p-3 rounded-lg bg-muted/50 border border-muted">
                  <p className="text-sm text-muted-foreground">
                    🔒 This complaint has been resolved and is now read-only.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {canEdit && (
            <Card className="border-0 shadow-card animate-slide-up border-destructive/20" style={{ animationDelay: '100ms' }}>
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
