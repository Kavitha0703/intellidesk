import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Send, ThumbsUp, Minus, ThumbsDown, Loader2 } from 'lucide-react';

export default function Feedback() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rating, setRating] = useState<'Good' | 'Average' | 'Bad' | ''>('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!rating) {
      newErrors.rating = 'Please select a rating';
    }

    if (!message.trim()) {
      newErrors.message = 'Feedback message cannot be empty';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Please provide more detail (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id || !profile) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit feedback.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          user_name: profile.name,
          rating: rating as 'Good' | 'Average' | 'Bad',
          message: message.trim(),
        });

      if (error) throw error;

      toast({
        title: 'Feedback Submitted Successfully!',
        description: 'Thank you for helping us improve our service.',
      });

      navigate('/user');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingOptions = [
    { value: 'Good', label: 'Good', icon: ThumbsUp, color: 'text-status-resolved' },
    { value: 'Average', label: 'Average', icon: Minus, color: 'text-status-pending' },
    { value: 'Bad', label: 'Bad', icon: ThumbsDown, color: 'text-destructive' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Submit Feedback"
        description="Help us improve by sharing your experience with the system."
        backHref="/user"
      />

      <Card className="max-w-2xl border-0 shadow-card animate-slide-up">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className={errors.rating ? 'text-destructive' : ''}>
                How would you rate your experience? *
              </Label>
              <RadioGroup
                value={rating}
                onValueChange={(value) => {
                  setRating(value as 'Good' | 'Average' | 'Bad');
                  if (errors.rating) setErrors({ ...errors, rating: '' });
                }}
                className="flex gap-4"
              >
                {ratingOptions.map((option) => (
                  <div key={option.value} className="flex-1">
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className={`flex flex-col items-center justify-center rounded-xl border-2 bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all ${errors.rating ? 'border-destructive/50' : 'border-muted'}`}
                    >
                      <option.icon className={`h-8 w-8 mb-2 ${rating === option.value ? option.color : 'text-muted-foreground'}`} />
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className={errors.message ? 'text-destructive' : ''}>
                Your Feedback * (minimum 10 characters)
              </Label>
              <Textarea
                id="message"
                placeholder="Share your thoughts, suggestions, or concerns..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors({ ...errors, message: '' });
                }}
                className={`min-h-[150px] ${errors.message ? 'border-destructive' : ''}`}
              />
              {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Submitted by: {profile?.name || 'User'}
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
                    Submit Feedback
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
