import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
}

export function PageHeader({ title, description, backHref }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-8 animate-slide-up">
      {backHref && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate(backHref)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      )}
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
