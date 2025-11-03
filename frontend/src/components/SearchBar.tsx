import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Coffee, Leaf } from 'lucide-react';
import { usersAPI } from '@/api/users';
import { SearchUser } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery || debouncedQuery.trim() === '') {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const data = await usersAPI.searchUsers(debouncedQuery);
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleUserClick = (username: string) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    navigate(`/user/${username}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 w-full"
        />
      </div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="max-h-96 overflow-y-auto shadow-lg">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="divide-y">
                  {results.map((user) => {
                    const SideIcon = user.side === 'coffee' ? Coffee : Leaf;
                    const sideColor = user.side === 'coffee' ? 'text-coffee' : 'text-tea';
                    
                    return (
                      <button
                        key={user._id}
                        onClick={() => handleUserClick(user.username)}
                        className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <SideIcon className={`w-5 h-5 ${sideColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{user.username}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {user.side} • {user.points || 0} points
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No users found
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

