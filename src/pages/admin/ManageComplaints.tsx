import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, SeverityBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Severity } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Filter, ClipboardList, Search, Eye, ArrowUpDown, Inbox } from 'lucide-react';

type SortOption = 'date-desc' | 'date-asc' | 'severity-high' | 'severity-low';

const severityOrder: Record<Severity, number> = {
  'Critical': 4,
  'Urgent': 3,
  'Medium': 2,
  'Not Urgent': 1,
};

export default function ManageComplaints() {
  const { complaints } = useApp();
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const filteredComplaints = complaints
    .filter(c => {
      const matchesSeverity = severityFilter === 'All' || c.severity === severityFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        c.id.toLowerCase().includes(query) ||
        c.userName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.issueType.toLowerCase().includes(query) ||
        c.severity.toLowerCase().includes(query) ||
        c.status.toLowerCase().includes(query);
      return matchesSeverity && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'severity-high':
          return severityOrder[b.severity] - severityOrder[a.severity];
        case 'severity-low':
          return severityOrder[a.severity] - severityOrder[b.severity];
        default:
          return 0;
      }
    });

  const severityLevels: (Severity | 'All')[] = ['All', 'Not Urgent', 'Medium', 'Urgent', 'Critical'];

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
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
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
            <span className="text-sm text-muted-foreground md:ml-auto">
              Showing {filteredComplaints.length} of {complaints.length} complaints
            </span>
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
                      <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{complaint.userName}</div>
                          <div className="text-xs text-muted-foreground">{complaint.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {complaint.issueType}
                        {complaint.issueType === 'Other' && complaint.otherIssue && (
                          <span className="text-muted-foreground text-sm block">
                            ({complaint.otherIssue})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={complaint.severity} />
                      </TableCell>
                      <TableCell>{formatDate(complaint.date)}</TableCell>
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
