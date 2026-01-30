import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar } from 'lucide-react';

export default function Notices() {
  const { notices } = useApp();

  return (
    <DashboardLayout>
      <PageHeader
        title="Notices & Notifications"
        description="Stay updated with the latest system announcements."
        backHref="/user"
      />

      {notices.length === 0 ? (
        <Card className="border-0 shadow-card animate-slide-up">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Notices</h3>
            <p className="text-muted-foreground text-center">
              There are no system notifications at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notices.map((notice, index) => (
            <Card 
              key={notice.id}
              className="border-0 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg gradient-user">
                      <Bell className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{notice.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {notice.date}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {notice.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
