import { ReactNode } from 'react';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
