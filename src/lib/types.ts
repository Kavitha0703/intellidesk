export type UserRole = 'user' | 'admin' | null;

export type IssueType = 'System' | 'Internet' | 'Software' | 'Hardware' | 'Other';

export type Severity = 'Not Urgent' | 'Medium' | 'Urgent' | 'Critical';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  userName: string;
  email: string;
  issueType: IssueType;
  otherIssue?: string;
  severity: Severity;
  description: string;
  date: string;
  status: ComplaintStatus;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
}

export interface Feedback {
  id: string;
  userName: string;
  rating: 'Good' | 'Average' | 'Bad';
  message: string;
  date: string;
}
