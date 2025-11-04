import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Plus, LogOut, User, MessageCircle, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './ui/button';
import { SearchBar } from './SearchBar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { currentSide } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get the side label dynamically from context
  const getSideLabel = () => {
    if (!user || !currentSide) return null;
    const emoji = currentSide === 'coffee' ? '☕' : '🍵';
    const label = currentSide === 'coffee' ? 'Coffee Lover' : 'Tea Lover';
    return `${emoji} ${label}`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/feed" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Coffee className="w-8 h-8 text-primary" />
            </motion.div>
            <span className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
              BrewBook
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/feed">
                  <Button variant="ghost" size="sm">
                    Feed
                  </Button>
                </Link>
                <Link to="/create">
                  <Button variant="default" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create
                  </Button>
                </Link>
                
                <Link to="/chat">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="w-4 h-4" /> Chat
                  </Button>
                </Link>

                <Link to="/barista">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Sparkles className="w-4 h-4" /> AI Barista
                  </Button>
                </Link>

                <Link to="/map">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MapPin className="w-4 h-4" /> Map
                  </Button>
                </Link>

                <SearchBar />
                
                <NotificationsDropdown />
                
                <div className="flex items-center gap-3 pl-4 border-l">
                  <Link to={`/user/${user.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="hidden md:block">
                      <p className="text-sm font-medium">{user.username}</p>
                      {getSideLabel() && (
                        <p className="text-xs text-muted-foreground">
                          {getSideLabel()}
                        </p>
                      )}
                    </div>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
