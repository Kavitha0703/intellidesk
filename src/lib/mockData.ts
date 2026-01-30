import { Complaint, Notice, Feedback } from './types';

export const initialComplaints: Complaint[] = [
  {
    id: 'CMP001',
    userName: 'John Doe',
    email: 'john.doe@company.com',
    issueType: 'Internet',
    severity: 'Urgent',
    description: 'Unable to connect to the company VPN from Lab 2. The connection times out after 30 seconds.',
    date: '2026-01-28',
    status: 'In Progress',
  },
  {
    id: 'CMP002',
    userName: 'Jane Smith',
    email: 'jane.smith@company.com',
    issueType: 'Hardware',
    severity: 'Critical',
    description: 'My workstation is not powering on. Tried multiple power outlets but no response.',
    date: '2026-01-27',
    status: 'Pending',
  },
  {
    id: 'CMP003',
    userName: 'Mike Johnson',
    email: 'mike.j@company.com',
    issueType: 'Software',
    severity: 'Medium',
    description: 'Microsoft Office keeps crashing when opening large Excel files.',
    date: '2026-01-25',
    status: 'Resolved',
  },
  {
    id: 'CMP004',
    userName: 'Sarah Wilson',
    email: 'sarah.w@company.com',
    issueType: 'System',
    severity: 'Not Urgent',
    description: 'Request for additional software installation - Adobe Creative Suite.',
    date: '2026-01-24',
    status: 'Pending',
  },
];

export const initialNotices: Notice[] = [
  {
    id: 'NOT001',
    title: 'Scheduled System Maintenance',
    message: 'There will be scheduled maintenance on Saturday, February 1st from 2:00 AM to 6:00 AM. All systems will be unavailable during this time.',
    date: '2026-01-30',
  },
  {
    id: 'NOT002',
    title: 'Internet Issue in Lab 2 Resolved',
    message: 'The internet connectivity issues in Lab 2 have been resolved. If you continue to experience problems, please submit a new complaint.',
    date: '2026-01-29',
  },
  {
    id: 'NOT003',
    title: 'New Software Update Available',
    message: 'A new update for the company antivirus software is available. Please restart your computers to apply the update.',
    date: '2026-01-28',
  },
];

export const initialFeedback: Feedback[] = [
  {
    id: 'FDB001',
    userName: 'John Doe',
    rating: 'Good',
    message: 'Quick response time! My issue was resolved within an hour.',
    date: '2026-01-28',
  },
  {
    id: 'FDB002',
    userName: 'Emily Brown',
    rating: 'Average',
    message: 'The system works well but could use a mobile app for easier access.',
    date: '2026-01-26',
  },
  {
    id: 'FDB003',
    userName: 'Alex Chen',
    rating: 'Good',
    message: 'Very organized and easy to track my complaints. Great job!',
    date: '2026-01-25',
  },
];
