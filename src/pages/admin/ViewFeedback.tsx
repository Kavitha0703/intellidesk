import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { ThumbsUp, Minus, ThumbsDown, User, Calendar, Inbox, Loader2 } from 'lucide-react';

interface FeedbackData {
  id: string;
  user_name: string;
  rating: 'Good' | 'Average' | 'Bad';
  message: string;
  created_at: string;
}

export default function ViewFeedback() {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setFeedback(data?.map(f => ({
          id: f.id,
          user_name: f.user_name,
          rating: f.rating as 'Good' | 'Average' | 'Bad',
          message: f.message,
          created_at: f.created_at,
        })) || []);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const getRatingIcon = (rating: 'Good' | 'Average' | 'Bad') => {
    switch (rating) {
      case 'Good':
        return <ThumbsUp className="h-4 w-4" />;
      case 'Average':
        return <Minus className="h-4 w-4" />;
      case 'Bad':
        return <ThumbsDown className="h-4 w-4" />;
    }
  };

  const getRatingVariant = (rating: 'Good' | 'Average' | 'Bad') => {
    switch (rating) {
      case 'Good':
        return 'resolved';
      case 'Average':
        return 'pending';
      case 'Bad':
        return 'critical';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="User Feedback"
        description="Review feedback submitted by users to improve the system."
        backHref="/admin"
      />

      {feedback.length === 0 ? (
        <Card className="border-0 shadow-card animate-slide-up">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Feedback Received Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Users haven't submitted any feedback yet. Feedback will appear here once users share their experiences.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedback.map((item, index) => (
            <Card 
              key={item.id}
              className="border-0 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-secondary">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.user_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getRatingVariant(item.rating)} className="flex items-center gap-1">
                    {getRatingIcon(item.rating)}
                    {item.rating}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  "{item.message}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
