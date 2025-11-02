import { Coffee, Leaf } from 'lucide-react';
import { Side } from '@/types';
import { motion } from 'framer-motion';

interface SideToggleProps {
  selected: Side | 'all';
  onChange: (side: Side | 'all') => void;
}

export const SideToggle: React.FC<SideToggleProps> = ({ selected, onChange }) => {
  const options: Array<{ value: Side | 'all'; label: string; icon: React.ReactNode }> = [
    { value: 'all', label: 'All', icon: null },
    { value: 'coffee', label: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
    { value: 'tea', label: 'Tea', icon: <Leaf className="w-4 h-4" /> },
  ];

  return (
    <div className="inline-flex rounded-lg bg-muted p-1 gap-1">
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${selected === option.value 
              ? 'text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
          whileTap={{ scale: 0.95 }}
        >
          {selected === option.value && (
            <motion.div
              layoutId="activeTab"
              className={`absolute inset-0 rounded-md ${
                option.value === 'coffee' 
                  ? 'bg-coffee-light' 
                  : option.value === 'tea'
                  ? 'bg-tea-light'
                  : 'bg-background'
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
