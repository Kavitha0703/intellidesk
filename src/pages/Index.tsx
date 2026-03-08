import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, User, Shield, CheckCircle, Clock, Bell, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();

  const features = [
    { icon: CheckCircle, title: 'Easy Submission', description: 'Submit IT complaints in seconds' },
    { icon: Clock, title: 'Real-time Tracking', description: 'Monitor complaint status live' },
    { icon: Bell, title: 'Instant Notifications', description: 'Stay updated with notices' },
    { icon: MessageSquare, title: 'Feedback System', description: 'Help us improve our service' },
  ];

  // If user is logged in, redirect to their dashboard
  const handleDashboardRedirect = () => {
    if (user && profile) {
      navigate(isAdmin ? '/admin' : '/user');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container relative py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Monitor className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">IT Support Made Simple</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              IntelliDesk
              <span className="block gradient-primary bg-clip-text text-transparent">
                Smart IT Support Platform
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your IT support process. Register complaints, track progress, 
              and receive updates—all in one centralized platform.
            </p>
            
            {/* User & Admin Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user && profile ? (
                <Button 
                  variant="heroUser" 
                  size="xl" 
                  onClick={handleDashboardRedirect}
                  className="w-full sm:w-auto"
                >
                  {isAdmin ? <Shield className="mr-2 h-5 w-5" /> : <User className="mr-2 h-5 w-5" />}
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="heroUser" 
                    size="xl" 
                    onClick={() => navigate('/auth?role=user')}
                    className="w-full sm:w-auto"
                  >
                    <User className="mr-2 h-5 w-5" />
                    User
                  </Button>
                  <Button 
                    variant="heroAdmin" 
                    size="xl" 
                    onClick={() => navigate('/auth?role=admin')}
                    className="w-full sm:w-auto"
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Admin
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete solution for managing IT complaints efficiently
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="text-center border-0 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="mx-auto mb-4 p-4 rounded-2xl gradient-primary w-fit">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Information */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="overflow-hidden border-0 shadow-card animate-slide-up">
              <div className="h-2 gradient-user" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl gradient-user">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>For Users</CardTitle>
                    <CardDescription>Employees & Staff</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-severity-not-urgent" />
                    Register IT complaints easily
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-severity-not-urgent" />
                    Track complaint status in real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-severity-not-urgent" />
                    Receive system notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-severity-not-urgent" />
                    Submit feedback for improvement
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="h-2 gradient-admin" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl gradient-admin">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>For Administrators</CardTitle>
                    <CardDescription>IT Support Team</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-severity-not-urgent" />
                    Manage all complaints centrally
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-severity-not-urgent" />
                    View all registered users
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-severity-not-urgent" />
                    Post system-wide notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-severity-not-urgent" />
                    Export complaints data (CSV)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 IT Complaint Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
