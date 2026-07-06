import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/lib/utils';
import { Search, Users, Loader2, Inbox, Shield, User, Plus } from 'lucide-react';
import { AddUserModal } from '@/components/admin/AddUserModal';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  created_at: string;
}

type RoleFilter = 'All' | AppRole;

function RoleBadge({ role }: { role: AppRole }) {
  return (
    <Badge variant={role === 'admin' ? 'default' : 'outline'} className="flex items-center gap-1 w-fit">
      {role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
      {role === 'admin' ? 'Admin' : 'User'}
    </Badge>
  );
}

function RoleSelector({
  user,
  currentUserId,
  onChange,
  disabled,
}: {
  user: UserWithRole;
  currentUserId?: string;
  onChange: (userId: string, role: AppRole) => Promise<void>;
  disabled?: boolean;
}) {
  const isSelf = currentUserId === user.id;
  return (
    <Select
      value={user.role}
      disabled={disabled || isSelf}
      onValueChange={(value) => onChange(user.id, value as AppRole)}
    >
      <SelectTrigger className="w-[110px] h-8" title={isSelf ? "You cannot change your own role" : undefined}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover">
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="user">User</SelectItem>
      </SelectContent>
    </Select>
  );
}

function UserCard({
  user,
  currentUserId,
  onRoleChange,
  updating,
}: {
  user: UserWithRole;
  currentUserId?: string;
  onRoleChange: (userId: string, role: AppRole) => Promise<void>;
  updating: boolean;
}) {
  return (
    <Card className="border-0 shadow-card animate-slide-up">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <RoleSelector user={user} currentUserId={currentUserId} onChange={onRoleChange} disabled={updating} />
        </div>
        <p className="text-xs text-muted-foreground">Registered: {formatDate(user.created_at)}</p>
      </CardContent>
    </Card>
  );
}

export default function ManageUsers() {
  const { isAdmin, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [defaultRoleForModal, setDefaultRoleForModal] = useState<AppRole>('user');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    const target = users.find((u) => u.id === userId);
    if (!target || target.role === newRole) return;
    setUpdatingUserId(userId);
    try {
      const response = await supabase.functions.invoke('update-user-role', {
        body: { user_id: userId, role: newRole },
      });
      if (response.error) throw new Error(response.error.message || 'Failed to update role');
      if (response.data?.error) throw new Error(response.data.error);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast({ title: 'Role Updated', description: `${target.name} is now ${newRole === 'admin' ? 'an admin' : 'a user'}.` });
    } catch (error) {
      logError('Error updating role:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to update role', variant: 'destructive' });
    } finally {
      setUpdatingUserId(null);
    }
  };


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase.from('user_roles').select('*');
      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: (userRole?.role || 'user') as AppRole,
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      logError('Error fetching users:', error);
      toast({ title: 'Error', description: 'Failed to load users.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    fetchUsers();
  }, [isAdmin, navigate]);

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  const handleAddUser = (role: AppRole) => {
    setDefaultRoleForModal(role);
    setAddModalOpen(true);
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
      <PageHeader title="View Users" description="View all registered users in the system." backHref="/admin" />

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
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleAddUser('admin')} title="Add Admin">
              <Plus className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{userCount}</p>
              <p className="text-sm text-muted-foreground">Regular Users</p>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleAddUser('user')} title="Add User">
              <Plus className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card className="border-0 shadow-card mb-6 animate-slide-up">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 sm:w-[300px]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Role:</span>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground sm:ml-auto">
              {filteredUsers.length} of {users.length}
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
              {searchQuery || roleFilter !== 'All' ? 'No users match your search criteria.' : 'There are no registered users.'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
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
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user.id} className="animate-slide-in-left" style={{ animationDelay: `${index * 50}ms` }}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><RoleBadge role={user.role} /></TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AddUserModal open={addModalOpen} onOpenChange={setAddModalOpen} defaultRole={defaultRoleForModal} onUserCreated={fetchUsers} />
    </DashboardLayout>
  );
}
