import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/shared/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Bell, MessageSquare, AlertTriangle, Clock, TrendingUp, Settings, Users } from 'lucide-react';

interface DashboardStats {
  totalComplaints: number;
  pendingCount: number;
  inProgressCount: number;
  criticalCount: number;
  noticesCount: number;
  feedbackCount: number;
  pendingUsersCount: number;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    pendingCount: 0,
    inProgressCount: 0,
    criticalCount: 0,
    noticesCount: 0,
    feedbackCount: 0,
    pendingUsersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch complaints stats
        const { data: complaints } = await supabase
          .from('complaints')
          .select('status, severity');

        const pendingCount = complaints?.filter(c => c.status === 'Pending').length || 0;
        const inProgressCount = complaints?.filter(c => c.status === 'In Progress').length || 0;
        const criticalCount = complaints?.filter(c => c.severity === 'Critical' && c.status !== 'Resolved').length || 0;

        // Fetch notices count
        const { count: noticesCount } = await supabase
          .from('notices')
          .select('*', { count: 'exact', head: true });

        // Fetch feedback count
        const { count: feedbackCount } = await supabase
          .from('feedback')
          .select('*', { count: 'exact', head: true });

        // Fetch pending users count
        const { count: pendingUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalComplaints: complaints?.length || 0,
          pendingCount,
          inProgressCount,
          criticalCount,
          noticesCount: noticesCount || 0,
          feedbackCount: feedbackCount || 0,
          pendingUsersCount: pendingUsersCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground">
          Admin Dashboard 🛡️
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {profile?.name || 'Admin'}. Here's your system overview.
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
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalComplaints}</div>
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
            <div className="text-3xl font-bold text-status-pending">{loading ? '...' : stats.pendingCount}</div>
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
            <div className="text-3xl font-bold text-status-in-progress">{loading ? '...' : stats.inProgressCount}</div>
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
            <div className="text-3xl font-bold text-severity-critical">{loading ? '...' : stats.criticalCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4 text-foreground">Management</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <DashboardCard
          title="Manage Complaints"
          description="Review and update complaint status"
          icon={ClipboardList}
          href="/admin/manage-complaints"
          count={stats.totalComplaints}
          gradient="admin"
        />
        <DashboardCard
          title="Manage Users"
          description="Approve user registrations"
          icon={Users}
          href="/admin/manage-users"
          count={stats.pendingUsersCount}
          gradient="admin"
        />
        <DashboardCard
          title="Manage Notices"
          description="Edit or delete posted notices"
          icon={Settings}
          href="/admin/manage-notices"
          count={stats.noticesCount}
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
          count={stats.feedbackCount}
          gradient="admin"
        />
      </div>
    </DashboardLayout>
  );
}
