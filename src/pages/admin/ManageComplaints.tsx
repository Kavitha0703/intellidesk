import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, SeverityBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Severity, ComplaintStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { exportComplaintsToPDF } from '@/lib/exportUtils';
import { Filter, ClipboardList, Search, Eye, ArrowUpDown, FileText, Loader2 } from 'lucide-react';

type SortOption = 'date-desc' | 'date-asc' | 'severity-high' | 'severity-low';

const severityOrder: Record<Severity, number> = {
  'Critical': 4,
  'Urgent': 3,
  'Medium': 2,
  'Not Urgent': 1,
};

interface ComplaintData {
  id: string;
  user_name: string;
  email: string;
  issue_type: string;
  other_issue: string | null;
  severity: Severity;
  description: string;
  status: ComplaintStatus;
  admin_comment: string | null;
  created_at: string;
}

export default function ManageComplaints() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setComplaints(data?.map(c => ({
          id: c.id,
          user_name: c.user_name,
          email: c.email,
          issue_type: c.issue_type,
          other_issue: c.other_issue,
          severity: c.severity as Severity,
          description: c.description,
          status: c.status as ComplaintStatus,
          admin_comment: c.admin_comment,
          created_at: c.created_at,
        })) || []);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        toast({
          title: 'Error',
          description: 'Failed to load complaints',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [toast]);

  const filteredComplaints = complaints
    .filter(c => {
      const matchesSeverity = severityFilter === 'All' || c.severity === severityFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        c.id.toLowerCase().includes(query) ||
        c.user_name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.issue_type.toLowerCase().includes(query) ||
        c.severity.toLowerCase().includes(query) ||
        c.status.toLowerCase().includes(query);
      return matchesSeverity && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'severity-high':
          return severityOrder[b.severity] - severityOrder[a.severity];
        case 'severity-low':
          return severityOrder[a.severity] - severityOrder[b.severity];
        default:
          return 0;
      }
    });

  const handleExportPDF = () => {
    if (filteredComplaints.length === 0) {
      toast({
        title: 'No Data',
        description: 'No complaints to export.',
        variant: 'destructive',
      });
      return;
    }

    exportComplaintsToPDF(filteredComplaints);
    toast({
      title: 'Export Successful',
      description: `Exported ${filteredComplaints.length} complaints to PDF.`,
    });
  };

  const severityLevels: (Severity | 'All')[] = ['All', 'Not Urgent', 'Medium', 'Urgent', 'Critical'];

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
        title="Manage Complaints"
        description="Review, update status, and manage all IT complaints."
        backHref="/admin"
      />

      {/* Filter & Search */}
      <Card className="border-0 shadow-card mb-6 animate-slide-up">
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, user, email, issue type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
            </div>
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Severity:</span>
              <Select
                value={severityFilter}
                onValueChange={(value) => setSeverityFilter(value as Severity | 'All')}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {severityLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort:</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="date-desc">Latest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="severity-high">Severity: High to Low</SelectItem>
                  <SelectItem value="severity-low">Severity: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 lg:ml-auto">
              <Button onClick={handleExportPDF} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <span className="text-sm text-muted-foreground">
                Showing {filteredComplaints.length} of {complaints.length} complaints
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredComplaints.length === 0 ? (
        <Card className="border-0 shadow-card animate-slide-up">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Complaints Found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || severityFilter !== 'All'
                ? 'No complaints match your search criteria.'
                : 'There are no complaints in the system.'}
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
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint, index) => (
                    <TableRow 
                      key={complaint.id}
                      className="animate-slide-in-left cursor-pointer hover:bg-muted/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/admin/complaint/${complaint.id}`)}
                    >
                      <TableCell className="font-mono text-sm">{complaint.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{complaint.user_name}</div>
                          <div className="text-xs text-muted-foreground">{complaint.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {complaint.issue_type}
                        {complaint.issue_type === 'Other' && complaint.other_issue && (
                          <span className="text-muted-foreground text-sm block">
                            ({complaint.other_issue})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={complaint.severity} />
                      </TableCell>
                      <TableCell>{formatDate(complaint.created_at)}</TableCell>
                      <TableCell>
                        <StatusBadge status={complaint.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/complaint/${complaint.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
