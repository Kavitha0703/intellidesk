import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserStatus, AppRole } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';
import { Search, Users, CheckCircle, XCircle, UserCheck, UserX, Loader2, Inbox } from 'lucide-react';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: AppRole;
  created_at: string;
}

type StatusFilter = 'All' | UserStatus;

function StatusBadge({ status }: { status: UserStatus }) {
  const variants: Record<UserStatus, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    approved: { variant: 'default', label: 'Approved' },
    rejected: { variant: 'destructive', label: 'Rejected' },
  };
  
  const { variant, label } = variants[status];
  
  return <Badge variant={variant}>{label}</Badge>;
}

function RoleBadge({ role }: { role: AppRole }) {
  return (
    <Badge variant={role === 'admin' ? 'default' : 'outline'}>
      {role === 'admin' ? 'Admin' : 'User'}
    </Badge>
  );
}

export default function ManageUsers() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    user: UserWithRole | null;
  }>({ open: false, action: null, user: null });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          status: profile.status as UserStatus,
          role: (userRole?.role || 'user') as AppRole,
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const handleApprove = async (user: UserWithRole) => {
    setActionLoading(user.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'User Approved',
        description: `${user.name} has been approved successfully.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: null, user: null });
    }
  };

  const handleReject = async (user: UserWithRole) => {
    setActionLoading(user.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'User Rejected',
        description: `${user.name} has been rejected.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: null, user: null });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const approvedCount = users.filter((u) => u.status === 'approved').length;

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
        title="Manage Users"
        description="Review and approve user registrations."
        backHref="/admin"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <UserCheck className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card className="border-0 shadow-card mb-6 animate-slide-up">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Status:</span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground md:ml-auto">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 ? (
        <Card className="border-0 shadow-card animate-slide-up">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Users Found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== 'All'
                ? 'No users match your search criteria.'
                : 'There are no registered users in the system.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-card animate-slide-up overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className="animate-slide-in-left"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({ open: true, action: 'approve', user })
                                }
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setConfirmDialog({ open: true, action: 'reject', user })
                                }
                                disabled={actionLoading === user.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {user.status === 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setConfirmDialog({ open: true, action: 'approve', user })
                              }
                              disabled={actionLoading === user.id}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Re-approve
                            </Button>
                          )}
                          {user.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setConfirmDialog({ open: true, action: 'reject', user })
                              }
                              disabled={actionLoading === user.id}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, action: null, user: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve' ? 'Approve User' : 'Reject User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'approve'
                ? `Are you sure you want to approve ${confirmDialog.user?.name}? They will be able to access the complaint system.`
                : `Are you sure you want to reject ${confirmDialog.user?.name}? They will not be able to access the complaint system.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.user) {
                  if (confirmDialog.action === 'approve') {
                    handleApprove(confirmDialog.user);
                  } else {
                    handleReject(confirmDialog.user);
                  }
                }
              }}
              className={
                confirmDialog.action === 'reject'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
