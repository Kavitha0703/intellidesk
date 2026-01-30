
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  count?: number;
  gradient?: 'user' | 'admin' | 'primary';
}

export function DashboardCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  count,
  gradient = 'primary' 
}: DashboardCardProps) {
  const navigate = useNavigate();

  const gradientClass = {
    user: 'gradient-user',
    admin: 'gradient-admin',
    primary: 'gradient-primary',
  }[gradient];

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 overflow-hidden"
      onClick={() => navigate(href)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl ${gradientClass} shadow-md`}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
          {count !== undefined && (
            <div className="text-3xl font-bold text-foreground">{count}</div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="mb-1 group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
