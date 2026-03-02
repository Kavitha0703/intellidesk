import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';
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
import { formatDate, isValidEmail } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';
import { ImageUpload, ImageNote } from '@/components/complaints/ImageUpload';

export default function RegisterComplaint() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: profile?.email || '',
    issueType: '' as IssueType | '',
    otherIssue: '',
    severity: '' as Severity | '',
    description: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imageNotes, setImageNotes] = useState<Record<number, ImageNote>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypes: IssueType[] = ['System', 'Internet', 'Software', 'Hardware', 'Other'];
  const severityLevels: Severity[] = ['Not Urgent', 'Medium', 'Urgent', 'Critical'];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.issueType) {
      newErrors.issueType = 'Please select an issue type';
    }

    if (formData.issueType === 'Other' && !formData.otherIssue.trim()) {
      newErrors.otherIssue = 'Please specify the issue type';
    }

    if (!formData.severity) {
      newErrors.severity = 'Please select a severity level';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description cannot be empty';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id || !profile) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a complaint.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first - store file paths (not public URLs) since bucket is private
      const imagePaths: string[] = [];
      const failedUploads: string[] = [];
      
      // Validate file types client-side as additional check (server enforces via bucket config)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      
      for (const image of images) {
        // Client-side validation (server also enforces these via bucket settings)
        if (!allowedTypes.includes(image.type)) {
          failedUploads.push(`${image.name} (invalid type)`);
          continue;
        }
        
        if (image.size > maxFileSize) {
          failedUploads.push(`${image.name} (too large)`);
          continue;
        }
        
        const fileExt = image.name.split('.').pop()?.toLowerCase();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('complaint-images')
          .upload(fileName, image);
        
        if (uploadError) {
          logError('Error uploading image:', uploadError);
          failedUploads.push(image.name);
          continue;
        }
        
        // Store just the file path - signed URLs will be generated when viewing
        imagePaths.push(fileName);
      }
      
      // Notify user of any failed uploads
      if (failedUploads.length > 0) {
        toast({
          title: 'Some images could not be uploaded',
          description: `Failed: ${failedUploads.join(', ')}`,
          variant: 'destructive',
        });
      }

      const statusHistory = [{
        status: 'Pending',
        date: new Date().toISOString(),
        note: 'Complaint submitted'
      }];

      // Build image_notes mapping: {storagePath: {title, description}}
      const imageNotesMap: Record<string, { title?: string; description?: string }> = {};
      imagePaths.forEach((path, idx) => {
        const note = imageNotes[idx];
        if (note && (note.title || note.description)) {
          imageNotesMap[path] = { title: note.title, description: note.description };
        }
      });

      const { error } = await supabase
        .from('complaints')
        .insert({
          user_id: user.id,
          user_name: profile.name,
          email: formData.email.trim(),
          issue_type: formData.issueType as IssueType,
          other_issue: formData.issueType === 'Other' ? formData.otherIssue.trim() : null,
          severity: formData.severity as Severity,
          description: formData.description.trim(),
          status: 'Pending',
          status_history: statusHistory,
          images: imagePaths,
          image_notes: imageNotesMap,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Complaint Submitted Successfully!',
        description: `Your complaint has been registered. We'll get back to you soon.`,
      });

      navigate('/user/view-complaints');
    } catch (error) {
      logError('Error submitting complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit complaint. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  value={profile?.name || ''}
                  disabled
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type *</Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) => {
                    setFormData({ ...formData, issueType: value as IssueType });
                    if (errors.issueType) setErrors({ ...errors, issueType: '' });
                  }}
                >
                  <SelectTrigger id="issueType" className={errors.issueType ? 'border-destructive' : ''}>
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
                {errors.issueType && <p className="text-sm text-destructive">{errors.issueType}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => {
                    setFormData({ ...formData, severity: value as Severity });
                    if (errors.severity) setErrors({ ...errors, severity: '' });
                  }}
                >
                  <SelectTrigger id="severity" className={errors.severity ? 'border-destructive' : ''}>
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
                {errors.severity && <p className="text-sm text-destructive">{errors.severity}</p>}
              </div>
            </div>

            {formData.issueType === 'Other' && (
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="otherIssue">Specify Other Issue *</Label>
                <Input
                  id="otherIssue"
                  placeholder="Describe the issue type"
                  value={formData.otherIssue}
                  onChange={(e) => {
                    setFormData({ ...formData, otherIssue: e.target.value });
                    if (errors.otherIssue) setErrors({ ...errors, otherIssue: '' });
                  }}
                  className={errors.otherIssue ? 'border-destructive' : ''}
                />
                {errors.otherIssue && <p className="text-sm text-destructive">{errors.otherIssue}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description * (minimum 10 characters)</Label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label>Upload Evidence (Optional)</Label>
              <ImageUpload 
                images={images} 
                onImagesChange={setImages}
                imageNotes={imageNotes}
                onImageNotesChange={setImageNotes}
                maxImages={5}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Date: {formatDate(new Date())}
              </p>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Complaint
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
