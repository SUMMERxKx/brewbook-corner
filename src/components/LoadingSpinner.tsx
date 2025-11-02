import { Coffee } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Coffee className="w-8 h-8 text-primary animate-pulse" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
};
