import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, User, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!profile) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate(isAdmin ? '/admin' : '/user')}
        >
          <div className={`p-2 rounded-lg ${isAdmin ? 'gradient-admin' : 'gradient-user'}`}>
            <Monitor className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">IT Complaint System</h1>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Administrator Panel' : 'User Portal'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
            {isAdmin ? (
              <Shield className="h-4 w-4 text-primary" />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium">{profile.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
