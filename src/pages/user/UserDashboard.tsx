import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/shared/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, Bell, MessageSquare, TrendingUp, Clock } from 'lucide-react';

export default function UserDashboard() {
  const { currentUser, complaints, notices } = useApp();
  
  const userComplaints = complaints.filter(c => c.userName === currentUser);
  const pendingCount = userComplaints.filter(c => c.status === 'Pending').length;
  const resolvedCount = userComplaints.filter(c => c.status === 'Resolved').length;

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {currentUser}! 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your IT complaints and stay updated with system notifications.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-0 shadow-card animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Complaints
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userComplaints.length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-status-pending">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
            <FileText className="h-4 w-4 text-status-resolved" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-status-resolved">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Register Complaint"
          description="Submit a new IT complaint"
          icon={FileText}
          href="/user/register-complaint"
          gradient="user"
        />
        <DashboardCard
          title="View My Complaints"
          description="Track your submitted complaints"
          icon={Eye}
          href="/user/view-complaints"
          count={userComplaints.length}
          gradient="user"
        />
        <DashboardCard
          title="Notices"
          description="Read system notifications"
          icon={Bell}
          href="/user/notices"
          count={notices.length}
          gradient="user"
        />
        <DashboardCard
          title="Feedback"
          description="Share your experience"
          icon={MessageSquare}
          href="/user/feedback"
          gradient="user"
        />
      </div>
    </DashboardLayout>
  );
}
