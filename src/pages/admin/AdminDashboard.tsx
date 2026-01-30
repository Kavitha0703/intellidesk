import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/shared/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Bell, MessageSquare, AlertTriangle, Clock, TrendingUp, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, complaints, notices, feedback } = useApp();
  
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const _resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const criticalCount = complaints.filter(c => c.severity === 'Critical' && c.status !== 'Resolved').length;

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground">
          Admin Dashboard 🛡️
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {currentUser}. Here's your system overview.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-0 shadow-card animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Complaints
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{complaints.length}</div>
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
              In Progress
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-in-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-status-in-progress">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Issues
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-severity-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-severity-critical">{criticalCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4 text-foreground">Management</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Manage Complaints"
          description="Review and update complaint status"
          icon={ClipboardList}
          href="/admin/manage-complaints"
          count={complaints.length}
          gradient="admin"
        />
        <DashboardCard
          title="Manage Notices"
          description="Edit or delete posted notices"
          icon={Settings}
          href="/admin/manage-notices"
          count={notices.length}
          gradient="admin"
        />
        <DashboardCard
          title="Post Notice"
          description="Create new notification"
          icon={Bell}
          href="/admin/post-notice"
          gradient="admin"
        />
        <DashboardCard
          title="View Feedback"
          description="Review user feedback"
          icon={MessageSquare}
          href="/admin/view-feedback"
          count={feedback.length}
          gradient="admin"
        />
      </div>
    </DashboardLayout>
  );
}
