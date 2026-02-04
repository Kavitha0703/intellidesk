import { formatDate } from './utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
 * Export complaints to PDF and trigger download
 */
export function exportComplaintsToPDF(complaints: ComplaintExport[]): void {
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(18);
  doc.text('IT Complaints Report', 14, 22);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Total Complaints: ${complaints.length}`, 14, 36);

  // Table data
  const tableData = complaints.map((complaint) => [
    complaint.id.slice(0, 8) + '...',
    complaint.user_name,
    complaint.email,
    complaint.issue_type === 'Other' && complaint.other_issue
      ? `Other: ${complaint.other_issue}`
      : complaint.issue_type,
    complaint.severity,
    complaint.description.length > 50 
      ? complaint.description.slice(0, 50) + '...' 
      : complaint.description,
    complaint.status,
    formatDate(complaint.created_at),
  ]);

  // Generate table
  autoTable(doc, {
    head: [['ID', 'User', 'Email', 'Issue Type', 'Severity', 'Description', 'Status', 'Date']],
    body: tableData,
    startY: 42,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Download
  const date = new Date().toISOString().split('T')[0];
  doc.save(`complaints_report_${date}.pdf`);
}

// Legacy CSV functions for backward compatibility
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
