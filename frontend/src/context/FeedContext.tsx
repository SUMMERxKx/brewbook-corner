import { createContext, useContext, useState, ReactNode } from 'react';
import type { FeedType } from '@/api/posts';

interface FeedContextType {
  feedType: FeedType;
  setFeedType: (type: FeedType) => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
};

interface FeedProviderProps {
  children: ReactNode;
}

export const FeedProvider = ({ children }: FeedProviderProps) => {
  const [feedType, setFeedType] = useState<FeedType>('discover');

  return (
    <FeedContext.Provider value={{ feedType, setFeedType }}>
      {children}
    </FeedContext.Provider>
  );
};

