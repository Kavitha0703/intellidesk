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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { IssueType, Severity } from '@/lib/types';
import { Send } from 'lucide-react';

export default function RegisterComplaint() {
  const { currentUser, setComplaints } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    issueType: '' as IssueType | '',
    otherIssue: '',
    severity: '' as Severity | '',
    description: '',
  });

  const issueTypes: IssueType[] = ['System', 'Internet', 'Software', 'Hardware', 'Other'];
  const severityLevels: Severity[] = ['Not Urgent', 'Medium', 'Urgent', 'Critical'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.issueType || !formData.severity || !formData.description) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const newComplaint = {
      id: `CMP${String(Date.now()).slice(-6)}`,
      userName: currentUser,
      email: formData.email,
      issueType: formData.issueType as IssueType,
      otherIssue: formData.otherIssue,
      severity: formData.severity as Severity,
      description: formData.description,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending' as const,
    };

    setComplaints(prev => [newComplaint, ...prev]);
    
    toast({
      title: 'Complaint Submitted!',
      description: `Your complaint ID is ${newComplaint.id}. We'll get back to you soon.`,
    });

    navigate('/user/view-complaints');
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Register Complaint"
        description="Submit a new IT complaint. Our team will address it promptly."
        backHref="/user"
      />

      <Card className="max-w-2xl border-0 shadow-card animate-slide-up">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={currentUser}
                  disabled
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type *</Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) => setFormData({ ...formData, issueType: value as IssueType })}
                >
                  <SelectTrigger id="issueType">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {issueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value as Severity })}
                >
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {severityLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.issueType === 'Other' && (
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="otherIssue">Specify Other Issue</Label>
                <Input
                  id="otherIssue"
                  placeholder="Describe the issue type"
                  value={formData.otherIssue}
                  onChange={(e) => setFormData({ ...formData, otherIssue: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Date: {new Date().toLocaleDateString()}
              </p>
              <Button type="submit" size="lg">
                <Send className="mr-2 h-4 w-4" />
                Submit Complaint
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
