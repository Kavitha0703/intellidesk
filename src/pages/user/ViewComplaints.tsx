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
import { formatDate } from '@/lib/utils';
import { FileText, Search, Eye, AlertCircle } from 'lucide-react';

export default function ViewComplaints() {
  const { currentUser, complaints } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const userComplaints = complaints.filter(c => c.userName === currentUser);
  
  const filteredComplaints = userComplaints.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(query) ||
      c.issueType.toLowerCase().includes(query) ||
      c.severity.toLowerCase().includes(query) ||
      c.status.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="My Complaints"
        description="Track and manage your submitted complaints."
        backHref="/user"
      />

      {/* Search Bar */}
      {userComplaints.length > 0 && (
        <Card className="border-0 shadow-card mb-6 animate-slide-up">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, issue type, severity, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              <span className="text-sm text-muted-foreground ml-auto">
                Showing {filteredComplaints.length} of {userComplaints.length} complaints
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {userComplaints.length === 0 ? (
        <Card className="border-0 shadow-card animate-slide-up">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Complaints Submitted Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              You haven't registered any IT complaints. If you're experiencing issues, click the button below to submit your first complaint.
            </p>
            <Button onClick={() => navigate('/user/register-complaint')}>
              Register Your First Complaint
            </Button>
          </CardContent>
        </Card>
      ) : filteredComplaints.length === 0 ? (
        <Card className="border-0 shadow-card animate-slide-up">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Results Found</h3>
            <p className="text-muted-foreground text-center">
              No complaints match your search "{searchQuery}".
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-card animate-slide-up overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>ID</TableHead>
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
                    onClick={() => navigate(`/user/complaint/${complaint.id}`)}
                  >
                    <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                    <TableCell>
                      {complaint.issueType}
                      {complaint.issueType === 'Other' && complaint.otherIssue && (
                        <span className="text-muted-foreground text-sm ml-1">
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
                          navigate(`/user/complaint/${complaint.id}`);
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
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
