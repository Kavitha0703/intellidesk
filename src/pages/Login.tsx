import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Monitor, User, Shield, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') as 'user' | 'admin' | null;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { setRole, setCurrentUser } = useApp();
  const navigate = useNavigate();

  const isAdmin = roleParam === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setCurrentUser(name.trim());
      setRole(roleParam || 'user');
      navigate(isAdmin ? '/admin' : '/user');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 gradient-hero opacity-5" />
      
      <div className="relative w-full max-w-md animate-scale-in">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-0 shadow-xl">
          <div className={`h-2 ${isAdmin ? 'gradient-admin' : 'gradient-user'}`} />
          <CardHeader className="text-center pb-2">
            <div className={`mx-auto mb-4 p-4 rounded-2xl ${isAdmin ? 'gradient-admin' : 'gradient-user'} w-fit`}>
              {isAdmin ? (
                <Shield className="h-8 w-8 text-primary-foreground" />
              ) : (
                <User className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isAdmin ? 'Admin Login' : 'User Login'}
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? 'Access the administrative dashboard' 
                : 'Submit and track your IT complaints'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                variant={isAdmin ? 'heroAdmin' : 'heroUser'}
                size="lg"
              >
                {isAdmin ? (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Login as Admin
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Login as User
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Monitor className="h-4 w-4" />
          <span>IT Complaint Management System</span>
        </div>
      </div>
    </div>
  );
}
