import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Bell } from 'lucide-react';

export default function PostNotice() {
  const { setNotices } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide both a title and message.',
        variant: 'destructive',
      });
      return;
    }

    const newNotice = {
      id: `NOT${String(Date.now()).slice(-6)}`,
      title: title.trim(),
      message: message.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    setNotices(prev => [newNotice, ...prev]);
    
    toast({
      title: 'Notice Posted!',
      description: 'Users will now see this notification.',
    });

    navigate('/admin');
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Post Notice"
        description="Create a new system notification for all users."
        backHref="/admin"
      />

      <Card className="max-w-2xl border-0 shadow-card animate-slide-up">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 mb-4">
              <div className="p-2 rounded-lg gradient-admin">
                <Bell className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">System Notice</p>
                <p className="text-sm text-muted-foreground">
                  This notice will be visible to all users on their Notices page.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Notice Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Scheduled System Maintenance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Notice Message *</Label>
              <Textarea
                id="message"
                placeholder="Provide details about the notice..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Date: {new Date().toLocaleDateString()}
              </p>
              <Button type="submit" size="lg">
                <Send className="mr-2 h-4 w-4" />
                Post Notice
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
