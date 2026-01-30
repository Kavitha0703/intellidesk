import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Notice } from '@/lib/types';
import { Pencil, Trash2, Bell, Calendar } from 'lucide-react';

export default function ManageNotices() {
  const { notices, setNotices } = useApp();
  const { toast } = useToast();

  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [deleteNoticeId, setDeleteNoticeId] = useState<string | null>(null);

  const handleEditClick = (notice: Notice) => {
    setEditingNotice(notice);
    setEditTitle(notice.title);
    setEditMessage(notice.message);
  };

  const handleSaveEdit = () => {
    if (!editingNotice) return;

    if (!editTitle.trim() || !editMessage.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide both a title and message.',
        variant: 'destructive',
      });
      return;
    }

    setNotices(prev =>
      prev.map(notice =>
        notice.id === editingNotice.id
          ? { ...notice, title: editTitle.trim(), message: editMessage.trim() }
          : notice
      )
    );

    toast({
      title: 'Notice Updated',
      description: 'The notice has been successfully updated.',
    });

    setEditingNotice(null);
    setEditTitle('');
    setEditMessage('');
  };

  const handleDeleteClick = (noticeId: string) => {
    setDeleteNoticeId(noticeId);
  };

  const handleConfirmDelete = () => {
    if (!deleteNoticeId) return;

    setNotices(prev => prev.filter(notice => notice.id !== deleteNoticeId));

    toast({
      title: 'Notice Deleted',
      description: 'The notice has been removed from the system.',
    });

    setDeleteNoticeId(null);
  };

  const noticeToDelete = notices.find(n => n.id === deleteNoticeId);

  return (
    <DashboardLayout>
      <PageHeader
        title="Manage Notices"
        description="View, edit, or delete system notifications."
        backHref="/admin"
      />

      <Card className="border-0 shadow-card animate-slide-up">
        <CardContent className="pt-6">
          {notices.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No notices posted</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a new notice to inform users about updates.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Notice ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="w-[120px]">Date Posted</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice, index) => (
                  <TableRow 
                    key={notice.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm">{notice.id}</TableCell>
                    <TableCell className="font-medium">{notice.title}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] truncate text-muted-foreground">
                      {notice.message}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {notice.date}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(notice)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(notice.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Notice Dialog */}
      <Dialog open={!!editingNotice} onOpenChange={(open) => !open && setEditingNotice(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
            <DialogDescription>
              Update the notice content. Changes will be visible to all users immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Notice Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter notice title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-message">Notice Message</Label>
              <Textarea
                id="edit-message"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                placeholder="Enter notice message"
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNotice(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteNoticeId} onOpenChange={(open) => !open && setDeleteNoticeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this notice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The notice "{noticeToDelete?.title}" will be permanently 
              removed and will no longer be visible to users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Notice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
