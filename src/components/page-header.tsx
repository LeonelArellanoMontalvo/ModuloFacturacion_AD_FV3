import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, action, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)} {...props}>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-headline text-primary">
        {title}
      </h1>
      {action && <div>{action}</div>}
    </div>
  );
}
