import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Shield, User, Monitor, Menu, FileText, Eye, Bell, MessageSquare, ClipboardList, Settings, Users, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const userNavItems = [
  { title: 'Dashboard', href: '/user', icon: Monitor },
  { title: 'Register Complaint', href: '/user/register-complaint', icon: FileText },
  { title: 'My Complaints', href: '/user/view-complaints', icon: Eye },
  { title: 'Notices', href: '/user/notices', icon: Bell },
  { title: 'Feedback', href: '/user/feedback', icon: MessageSquare },
];

const adminNavItems = [
  { title: 'Dashboard', href: '/admin', icon: Monitor },
  { title: 'Manage Complaints', href: '/admin/manage-complaints', icon: ClipboardList },
  { title: 'View Users', href: '/admin/manage-users', icon: Users },
  { title: 'Manage Notices', href: '/admin/manage-notices', icon: Settings },
  { title: 'Post Notice', href: '/admin/post-notice', icon: Plus },
  { title: 'View Feedback', href: '/admin/view-feedback', icon: MessageSquare },
];

export function Header() {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = async () => {
    setSheetOpen(false);
    await signOut();
    navigate('/');
  };

  const handleNav = (href: string) => {
    setSheetOpen(false);
    navigate(href);
  };

  if (!profile) return null;

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Hamburger on mobile, Logo always */}
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isAdmin ? 'gradient-admin' : 'gradient-user'}`}>
                      <Monitor className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span>IT Complaint System</span>
                  </SheetTitle>
                </SheetHeader>
                
                {/* User info */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium">{profile.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAdmin ? 'Administrator' : 'User'}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col p-2">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNav(item.href)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </button>
                    );
                  })}
                </nav>

                {/* Logout */}
                <div className="mt-auto p-4 border-t absolute bottom-0 left-0 right-0">
                  <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate(isAdmin ? '/admin' : '/user')}
          >
            <div className={`p-2 rounded-lg ${isAdmin ? 'gradient-admin' : 'gradient-user'}`}>
              <Monitor className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-foreground">IT Complaint System</div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Administrator Panel' : 'User Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: user badge + logout (hidden on mobile, shown in sheet) */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
            {isAdmin ? (
              <Shield className="h-4 w-4 text-primary" />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium">{profile.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
