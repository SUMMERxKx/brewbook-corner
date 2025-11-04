import { motion } from 'framer-motion';
import { useFeed } from '@/context/FeedContext';
import { useTheme } from '@/context/ThemeContext';
import { Coffee, Leaf, Users, Globe } from 'lucide-react';
import type { FeedType } from '@/api/posts';

const feedOptions: Array<{ value: FeedType; label: string; icon: React.ReactNode }> = [
  { 
    value: 'discover', 
    label: 'Discover', 
    icon: <Globe className="w-4 h-4" />
  },
  { 
    value: 'friends', 
    label: 'Friends', 
    icon: <Users className="w-4 h-4" />
  },
  { 
    value: 'side', 
    label: 'My Side', 
    icon: null // Will be set dynamically based on theme
  },
];

export const FeedTabs = () => {
  const { feedType, setFeedType } = useFeed();
  const { currentSide } = useTheme();

  // Update side icon based on current theme
  const sideOption = feedOptions.find(opt => opt.value === 'side');
  if (sideOption) {
    sideOption.icon = currentSide === 'coffee' ? (
      <Coffee className="w-4 h-4" />
    ) : (
      <Leaf className="w-4 h-4" />
    );
  }

  return (
    <div className="inline-flex rounded-lg bg-muted p-1 gap-1">
      {feedOptions.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => setFeedType(option.value)}
          className={`
            relative px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${feedType === option.value 
              ? 'text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
          whileTap={{ scale: 0.95 }}
        >
          {feedType === option.value && (
            <motion.div
              layoutId="activeTab"
              className={`absolute inset-0 rounded-md ${
                currentSide === 'coffee' 
                  ? 'bg-coffee-light' 
                  : 'bg-tea-light'
              }`}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            {option.icon}
            {option.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

