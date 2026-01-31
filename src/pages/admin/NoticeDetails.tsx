import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
import { Pencil, Trash2, ArrowLeft, Calendar, Bell, AlertTriangle, Save, X } from 'lucide-react';

export default function NoticeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notices, setNotices } = useApp();
  const { toast } = useToast();
  
  const notice = notices.find(n => n.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: notice?.title || '',
    message: notice?.message || '',
  });

  if (!notice) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Notice Not Found</h2>
          <p className="text-muted-foreground mb-4">This notice doesn't exist.</p>
          <Button onClick={() => navigate('/admin/manage-notices')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Notices
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = () => {
    if (!editData.title.trim() || !editData.message.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide both title and message.',
        variant: 'destructive',
      });
      return;
    }

    setNotices(prev =>
      prev.map(n =>
        n.id === notice.id
          ? {
              ...n,
              title: editData.title.trim(),
              message: editData.message.trim(),
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : n
      )
    );
    setIsEditing(false);
    toast({
      title: 'Notice Updated',
      description: 'The notice has been updated successfully.',
    });
  };

  const handleDelete = () => {
    setNotices(prev => prev.filter(n => n.id !== notice.id));
    toast({
      title: 'Notice Deleted',
      description: 'The notice has been removed successfully.',
    });
    navigate('/admin/manage-notices');
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={`Notice ${notice.id}`}
        description="View and manage notice details."
        backHref="/admin/manage-notices"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notice Details
              </CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Notice Title</Label>
                    <Input
                      id="title"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="Notice title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Notice Message</Label>
                    <Textarea
                      id="message"
                      value={editData.message}
                      onChange={(e) => setEditData({ ...editData, message: e.target.value })}
                      className="min-h-[200px]"
                      placeholder="Notice message..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false);
                      setEditData({ title: notice.title, message: notice.message });
                    }}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-2">Title</p>
                    <h3 className="text-xl font-semibold">{notice.title}</h3>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-2">Message</p>
                    <p className="text-foreground whitespace-pre-wrap">{notice.message}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <Card className="border-0 shadow-card animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardHeader>
              <CardTitle>Notice Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Posted:</span>
                <span className="font-medium">{notice.date}</span>
              </div>
              {notice.lastUpdated && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">{notice.lastUpdated}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Notice ID:</span>
                <span className="font-mono text-sm">{notice.id}</span>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-0 shadow-card animate-slide-up border-destructive/20" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Delete this notice permanently. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Notice
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this notice. Users will no longer see it. This action cannot be undone.
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
