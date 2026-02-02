import { formatDate } from './utils';

interface ComplaintExport {
  id: string;
  user_name: string;
  email: string;
  issue_type: string;
  other_issue?: string | null;
  severity: string;
  description: string;
  status: string;
  admin_comment?: string | null;
  created_at: string;
}

/**
 * Convert complaints data to CSV format
 */
export function complaintsToCSV(complaints: ComplaintExport[]): string {
  const headers = [
    'Complaint ID',
    'User Name',
    'Email',
    'Issue Type',
    'Severity',
    'Description',
    'Status',
    'Admin Comment',
    'Date Submitted',
  ];

  const rows = complaints.map((complaint) => [
    complaint.id,
    complaint.user_name,
    complaint.email,
    complaint.issue_type === 'Other' && complaint.other_issue
      ? `Other: ${complaint.other_issue}`
      : complaint.issue_type,
    complaint.severity,
    // Escape quotes and wrap in quotes for CSV
    `"${complaint.description.replace(/"/g, '""')}"`,
    complaint.status,
    complaint.admin_comment ? `"${complaint.admin_comment.replace(/"/g, '""')}"` : '',
    formatDate(complaint.created_at),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download a CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export complaints to CSV and trigger download
 */
export function exportComplaintsToCSV(complaints: ComplaintExport[]): void {
  const csvContent = complaintsToCSV(complaints);
  const date = new Date().toISOString().split('T')[0];
  const filename = `complaints_export_${date}.csv`;
  downloadCSV(csvContent, filename);
}
