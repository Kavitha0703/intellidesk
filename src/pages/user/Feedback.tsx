import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Send, ThumbsUp, Minus, ThumbsDown } from 'lucide-react';

export default function Feedback() {
  const { currentUser, setFeedback } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rating, setRating] = useState<'Good' | 'Average' | 'Bad' | ''>('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !message.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide both a rating and your feedback.',
        variant: 'destructive',
      });
      return;
    }

    const newFeedback = {
      id: `FDB${String(Date.now()).slice(-6)}`,
      userName: currentUser,
      rating: rating as 'Good' | 'Average' | 'Bad',
      message: message.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    setFeedback(prev => [newFeedback, ...prev]);
    
    toast({
      title: 'Feedback Submitted!',
      description: 'Thank you for helping us improve our service.',
    });

    navigate('/user');
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
              <Label>How would you rate your experience? *</Label>
              <RadioGroup
                value={rating}
                onValueChange={(value) => setRating(value as 'Good' | 'Average' | 'Bad')}
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
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <option.icon className={`h-8 w-8 mb-2 ${rating === option.value ? option.color : 'text-muted-foreground'}`} />
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Your Feedback *</Label>
              <Textarea
                id="message"
                placeholder="Share your thoughts, suggestions, or concerns..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Submitted by: {currentUser}
              </p>
              <Button type="submit" size="lg">
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
