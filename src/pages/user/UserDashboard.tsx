import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/shared/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, Bell, MessageSquare, TrendingUp, Clock, Loader2 } from 'lucide-react';

interface DashboardStats {
  totalComplaints: number;
  pendingCount: number;
  resolvedCount: number;
  noticesCount: number;
}

export default function UserDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    pendingCount: 0,
    resolvedCount: 0,
    noticesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user's complaints
        const { data: complaints } = await supabase
          .from('complaints')
          .select('status');

        const pendingCount = complaints?.filter(c => c.status === 'Pending').length || 0;
        const resolvedCount = complaints?.filter(c => c.status === 'Resolved').length || 0;

        // Fetch notices count
        const { count: noticesCount } = await supabase
          .from('notices')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalComplaints: complaints?.length || 0,
          pendingCount,
          resolvedCount,
          noticesCount: noticesCount || 0,
        });
      } catch (error) {
        logError('Error fetching dashboard stats:', error);
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
          Welcome back, {profile?.name || 'User'}! 👋
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
            <div className="text-3xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalComplaints}
            </div>
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
            <div className="text-3xl font-bold text-status-pending">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendingCount}
            </div>
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
            <div className="text-3xl font-bold text-status-resolved">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.resolvedCount}
            </div>
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
          count={stats.totalComplaints}
          gradient="user"
        />
        <DashboardCard
          title="Notices"
          description="Read system notifications"
          icon={Bell}
          href="/user/notices"
          count={stats.noticesCount}
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
