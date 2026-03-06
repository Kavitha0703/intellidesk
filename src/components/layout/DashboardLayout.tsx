import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Header } from './Header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();

  // Show FAB only for users (not admins) and not on the register complaint page itself
  const showFAB = isMobile && !isAdmin && location.pathname !== '/user/register-complaint';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-8 animate-fade-in px-4 md:px-8">
        {children}
      </main>

      {/* Floating Action Button */}
      {showFAB && (
        <Button
          onClick={() => navigate('/user/register-complaint')}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-xl gradient-user"
          size="icon"
        >
          <Plus className="h-6 w-6 text-primary-foreground" />
        </Button>
      )}
    </div>
  );
}
