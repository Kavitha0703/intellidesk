import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, Complaint, Notice, Feedback } from '@/lib/types';
import { initialComplaints, initialNotices, initialFeedback } from '@/lib/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: string;
  setCurrentUser: (name: string) => void;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  notices: Notice[];
  setNotices: React.Dispatch<React.SetStateAction<Notice[]>>;
  feedback: Feedback[];
  setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);

  const logout = () => {
    setRole(null);
    setCurrentUser('');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        complaints,
        setComplaints,
        notices,
        setNotices,
        feedback,
        setFeedback,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
